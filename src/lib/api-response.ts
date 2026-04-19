import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ApiSuccessBody<T> = {
  success: true;
  data: T;
  error: null;
  pagination?: PaginationMeta;
};

export type ApiErrorBody = {
  success: false;
  data: null;
  error: string | { message: string; issues?: unknown };
  pagination?: null;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function ok<T>(data: T, pagination?: PaginationMeta): NextResponse<ApiSuccessBody<T>> {
  const body: ApiSuccessBody<T> = pagination
    ? { success: true, data, error: null, pagination }
    : { success: true, data, error: null };
  return NextResponse.json(body);
}

export function fail(
  status: number,
  error: string | { message: string; issues?: unknown },
): NextResponse<ApiErrorBody> {
  return NextResponse.json({ success: false, data: null, error, pagination: null }, { status });
}

export function failZod(status: number, zodError: ZodError): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    {
      success: false,
      data: null,
      error: { message: "Validation error", issues: zodError.flatten() },
      pagination: null,
    },
    { status },
  );
}

export function handleRouteError(e: unknown): NextResponse<ApiErrorBody> {
  if (e instanceof ApiError) {
    const err =
      typeof e.details !== "undefined"
        ? { message: e.message, issues: e.details }
        : e.message;
    return fail(e.status, err);
  }
  console.error("[api]", e);
  return fail(500, "Internal Server Error");
}
