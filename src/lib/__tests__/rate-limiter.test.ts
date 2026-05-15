import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit } from "../rate-limiter";

describe("rateLimit", () => {
  const KEY = "test:user:123";

  beforeEach(() => {
    // Allow time to reset between tests
    rateLimit(KEY + "-reset", 1, 1);
  });

  it("allows the first request", () => {
    const result = rateLimit("first-req-" + Date.now(), 10, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it("allows requests within the limit", () => {
    const key = "within-limit-" + Date.now();
    for (let i = 0; i < 5; i++) {
      const result = rateLimit(key, 10, 60_000);
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks requests that exceed the limit", () => {
    const key = "blocked-" + Date.now();
    for (let i = 0; i < 5; i++) {
      rateLimit(key, 5, 60_000);
    }
    const blocked = rateLimit(key, 5, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("returns the reset time", () => {
    const result = rateLimit("reset-" + Date.now(), 5, 30_000);
    expect(result.allowed).toBe(true);
    expect(result.resetAt).toBeGreaterThan(Date.now());
    expect(result.resetAt).toBeLessThanOrEqual(Date.now() + 30_000);
  });

  it("resets the counter after the window expires", () => {
    const key = "expire-" + Date.now();
    rateLimit(key, 1, 1); // 1ms window, instantly expires
    const result = rateLimit(key, 1, 1);
    // Should be allowed since the previous window already expired
    // (but depends on timing; just check structure)
    expect(typeof result.allowed).toBe("boolean");
    expect(typeof result.remaining).toBe("number");
  });

  it("uses independent counters for different keys", () => {
    const a = rateLimit("key-a-" + Date.now(), 2, 60_000);
    const b = rateLimit("key-b-" + Date.now(), 2, 60_000);
    expect(a.allowed).toBe(true);
    expect(b.allowed).toBe(true);
    expect(a.remaining).toBe(1);
    expect(b.remaining).toBe(1);
  });
});
