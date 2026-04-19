import { Prisma } from "@prisma/client";

/**
 * Sérialise les Decimal Prisma pour JSON (évite les objets non sérialisables).
 */
export function jsonReady<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) => {
      if (value instanceof Prisma.Decimal) return value.toString();
      return value;
    }),
  ) as T;
}
