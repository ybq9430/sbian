import { describe, it, expect, vi } from "vitest";

// Test AuthError class
import { AuthError } from "../auth-helpers";

describe("AuthError", () => {
  it("creates an error with default 401 status", () => {
    const err = new AuthError("Unauthorized");
    expect(err.message).toBe("Unauthorized");
    expect(err.status).toBe(401);
    expect(err).toBeInstanceOf(Error);
  });

  it("creates an error with custom status", () => {
    const err = new AuthError("Forbidden", 403);
    expect(err.message).toBe("Forbidden");
    expect(err.status).toBe(403);
  });
});
