import type { NextRequest, NextResponse } from "next/server";
import rateLimit from "next-rate-limit";
import { fail, type ApiErrorBody } from "@/lib/api-response";

const publicRead = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 15_000 });
const publicWrite = rateLimit({ interval: 15 * 60 * 1000, uniqueTokenPerInterval: 5000 });
const adminApi = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 8000 });
const distributorApi = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 8000 });

export type RateLimitKind = "publicRead" | "publicWrite" | "admin" | "distributor";

const limiters: Record<RateLimitKind, ReturnType<typeof rateLimit>> = {
  publicRead,
  publicWrite,
  admin: adminApi,
  distributor: distributorApi,
};

const maxByKind: Record<RateLimitKind, number> = {
  publicRead: 120,
  publicWrite: 20,
  admin: 300,
  distributor: 90,
};

/**
 * Retourne une réponse 429 si la limite est dépassée, sinon null.
 */
export function consumeRateLimit(
  request: NextRequest,
  kind: RateLimitKind,
): NextResponse<ApiErrorBody> | null {
  const limiter = limiters[kind];
  const max = maxByKind[kind];
  try {
    limiter.checkNext(request, max);
    return null;
  } catch {
    return fail(429, "Too Many Requests");
  }
}
