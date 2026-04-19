import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

/** Session staff : 30 minutes (durée maximale du jeton). */
const sessionMaxAge = 60 * 30;

export const authConfig = {
  trustHost: true,
  providers: [],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: sessionMaxAge,
    updateAge: 60 * 5,
  },
  callbacks: {
    authorized({ request, auth }) {
      const path = request.nextUrl.pathname;
      if (path.startsWith("/api")) {
        return true;
      }
      if (path.startsWith("/admin")) {
        if (!auth?.user) {
          const login = new URL("/login", request.url);
          login.searchParams.set("callbackUrl", path);
          return NextResponse.redirect(login);
        }
        if (auth.user.role !== "ADMIN" && auth.user.role !== "MANAGER") {
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
      }
      if (path.startsWith("/distributeur")) {
        if (!auth?.user) {
          const login = new URL("/login", request.url);
          login.searchParams.set("callbackUrl", path);
          return NextResponse.redirect(login);
        }
        if (auth.user.role !== "DISTRIBUTOR") {
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role =
          (token.role as (typeof session.user)["role"] | undefined) ?? "DISTRIBUTOR";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
