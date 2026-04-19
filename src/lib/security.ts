import createDOMPurify from "isomorphic-dompurify";
import Tokens from "csrf";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginRateLimiter } from "@/lib/login-rate-limit";

const purify = createDOMPurify();

/** Texte utilisateur : HTML neutralisé pour stockage / logs. */
export function sanitizeText(input: string, maxLen = 10_000): string {
  const trimmed = input.slice(0, maxLen);
  return purify.sanitize(trimmed, { ALLOWED_TAGS: [] });
}

export function getClientIp(request: Request): string | null {
  const h = request.headers;
  const xff = h.get("x-forwarded-for");
  if (xff) {
    return xff.split(",")[0]?.trim() ?? null;
  }
  return h.get("x-real-ip") ?? h.get("cf-connecting-ip");
}

const tokens = new Tokens();

export function createCsrfSecret(): string {
  return tokens.secretSync();
}

export function createCsrfToken(secret: string): string {
  return tokens.create(secret);
}

export function verifyCsrfToken(secret: string, token: string): boolean {
  return tokens.verify(secret, token);
}

export function getCsrfSecretFromCookie(request: Request): string | null {
  const raw = request.headers.get("cookie");
  if (!raw) return null;
  const match = raw.match(/(?:^|;\s*)csrf-secret=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function consumeLoginRateLimit(request: NextRequest): Headers | null {
  try {
    return loginRateLimiter.checkNext(request, 5);
  } catch {
    return null;
  }
}

export async function writeAuditLog(params: {
  userId?: string | null;
  action: string;
  resource: string;
  details?: string | null;
  ip?: string | null;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? undefined,
        action: sanitizeText(params.action, 200),
        resource: sanitizeText(params.resource, 200),
        details: params.details ? sanitizeText(params.details, 8000) : undefined,
        ip: params.ip ? sanitizeText(params.ip, 64) : undefined,
      },
    });
  } catch (e) {
    console.error("[audit]", e);
  }
}
