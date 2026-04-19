import rateLimit from "next-rate-limit";

/** 5 tentatives de connexion par IP / 15 minutes (next-rate-limit + LRU). */
export const loginRateLimiter = rateLimit({
  interval: 15 * 60 * 1000,
  uniqueTokenPerInterval: 5000,
});
