import { describe, it, expect, vi, beforeEach } from "vitest";
import { withErrorHandler, validateBody, ok, badRequest, notFound } from "../api-handler";
import { AuthError } from "../auth-helpers";
import { z } from "zod";

// Helper to simulate a Next.js Request
function mockReq(url = "http://localhost/api/test"): Request {
  return new Request(url);
}

describe("withErrorHandler", () => {
  it("passes through successful handler", async () => {
    const handler = withErrorHandler(async () => ok({ hello: "world" }));
    const res = await handler(mockReq(), { params: {} });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.hello).toBe("world");
  });

  it("catches AuthError and returns 401", async () => {
    const handler = withErrorHandler(async () => { throw new AuthError("Unauthorized"); });
    const res = await handler(mockReq(), { params: {} });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("catches AuthError with custom status", async () => {
    const handler = withErrorHandler(async () => { throw new AuthError("Forbidden", 403); });
    const res = await handler(mockReq(), { params: {} });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe("Forbidden");
  });

  it("catches ZodError and returns 400 with details", async () => {
    const schema = z.object({ name: z.string().min(1) });
    const handler = withErrorHandler(async () => {
      schema.parse({ name: "" });
      return ok({});
    });
    const res = await handler(mockReq(), { params: {} });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Validation failed");
    expect(body.details).toBeDefined();
  });

  it("catches unexpected errors and returns 500", async () => {
    const handler = withErrorHandler(async () => { throw new Error("Boom"); });
    const res = await handler(mockReq(), { params: {} });
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Internal server error");
  });

  it("passes request context to handler", async () => {
    const handler = withErrorHandler(async (_req, context) => {
      return ok({ id: context?.params?.id });
    });
    const res = await handler(mockReq(), { params: { id: "123" } });
    expect(res.status).toBe(200);
    expect((await res.json()).id).toBe("123");
  });
});

describe("validateBody", () => {
  const schema = z.object({ email: z.string().email() });

  it("returns parsed data when valid", () => {
    expect(validateBody(schema, { email: "a@b.com" }).email).toBe("a@b.com");
  });

  it("throws ZodError when invalid", () => {
    expect(() => validateBody(schema, { email: "bad" })).toThrow();
  });
});

describe("response helpers", () => {
  it("ok returns JSON with given status", async () => {
    const res = ok({ x: 1 }, 201);
    expect(res.status).toBe(201);
    expect((await res.json()).x).toBe(1);
  });

  it("badRequest returns 400", async () => {
    const res = badRequest("missing field");
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("missing field");
  });

  it("notFound returns 404 with custom message", async () => {
    const res = notFound("Product not found");
    expect(res.status).toBe(404);
    expect((await res.json()).error).toBe("Product not found");
  });

  it("notFound defaults message", async () => {
    const res = notFound();
    expect(res.status).toBe(404);
    expect((await res.json()).error).toBe("Not found");
  });
});
