import bundleAnalyzer from "@next/bundle-analyzer";
import helmet from "helmet";

const withAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

const isProd = process.env.NODE_ENV === "production";

/** Stack Docker locale http://localhost — sans TLS, ne pas forcer upgrade-insecure-requests. */
const dockerLocalHttp = process.env.DOCKER_LOCAL_HTTP === "1";

const baseDirectives = {
  ...helmet.contentSecurityPolicy.getDefaultDirectives(),
  "default-src": ["'self'"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "blob:", "https:"],
  "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
  "frame-ancestors": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "object-src": ["'none'"],
  "upgrade-insecure-requests": [],
};
if (dockerLocalHttp) {
  delete baseDirectives["upgrade-insecure-requests"];
}

/** CSP : moins permissif en production (pas de eval). Monitoring Vercel + Sentry autorisés si besoin. */
const cspDirectives = isProd
  ? {
      ...baseDirectives,
      "script-src": [
        "'self'",
        "'unsafe-inline'",
        "https://va.vercel-scripts.com",
        "https://*.vercel-scripts.com",
        "https://browser.sentry-cdn.com",
      ],
      "connect-src": [
        "'self'",
        "https://vitals.vercel-insights.com",
        "https://*.vercel-insights.com",
        "https://vercel.live",
        "https://*.ingest.sentry.io",
        "https://*.ingest.de.sentry.io",
      ],
    }
  : {
      ...baseDirectives,
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      "connect-src": ["'self'"],
    };

function cspHeaderValue(directives) {
  return Object.entries(directives)
    .map(([key, value]) => {
      if (value === null || value === undefined) return null;
      const list = typeof value === "string" ? [value] : [...value];
      if (list.length === 0) return key;
      return `${key} ${list.join(" ")}`;
    })
    .filter(Boolean)
    .join("; ");
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com", pathname: "/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  async headers() {
    const base = [
      { key: "X-DNS-Prefetch-Control", value: "on" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      {
        key: "Content-Security-Policy",
        value: cspHeaderValue(cspDirectives),
      },
    ];
    if (isProd && !dockerLocalHttp) {
      base.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }
    return [{ source: "/:path*", headers: base }];
  },
};

export default withAnalyzer(nextConfig);
