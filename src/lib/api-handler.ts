import { NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";
import { AuthError } from "./auth-helpers";
import { rateLimitReq } from "./rate-limiter";

type RouteContext = { params: Record<string, string> };
type HandlerFn = (req: Request, context: RouteContext) => Promise<NextResponse>;

export function withErrorHandler(fn: HandlerFn): HandlerFn {
  return async (req: Request, context: RouteContext) => {
    const rl = rateLimitReq(req);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests", retryAfter: Math.ceil((rl.resetAt - Date.now()) / 1000) },
        { status: 429, headers: { "X-RateLimit-Remaining": "0", "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    try {
      const res = await fn(req, context);
      res.headers.set("X-RateLimit-Remaining", String(rl.remaining));
      return res;
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
