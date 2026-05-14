import { NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";
import { AuthError } from "./auth-helpers";

type HandlerFn = (req: Request, params?: any) => Promise<NextResponse>;

export function withErrorHandler(fn: HandlerFn): HandlerFn {
  return async (req: Request, params?: any) => {
    try {
      return await fn(req, params);
    } catch (e) {
      if (e instanceof AuthError) {
        return NextResponse.json({ error: e.message }, { status: e.status });
      }
      if (e instanceof ZodError) {
        return NextResponse.json({ error: "Validation failed", details: e.errors }, { status: 400 });
      }
      console.error("API error:", e);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}

export function validateBody<T>(schema: ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}
