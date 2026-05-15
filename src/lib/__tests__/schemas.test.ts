import { describe, it, expect } from "vitest";
import { ZodError } from "zod";
import {
  registerSchema,
  productSchema,
  orderSchema,
  discussionSchema,
  bundleSchema,
  checkoutSchema,
  notificationReadSchema,
  teamDeleteSchema,
  apiKeySchema,
  webhookSchema,
  teamSchema,
  licenseGenSchema,
  gamificationSchema,
  aIDescribeSchema,
} from "../schemas";

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const r = registerSchema.parse({ email: "test@example.com", password: "pass123", name: "Test" });
    expect(r.email).toBe("test@example.com");
  });

  it("rejects short password", () => {
    expect(() => registerSchema.parse({ email: "a@b.com", password: "123", name: "T" })).toThrow(ZodError);
  });

  it("rejects invalid email", () => {
    expect(() => registerSchema.parse({ email: "not-email", password: "pass123", name: "T" })).toThrow(ZodError);
  });
});

describe("productSchema", () => {
  it("accepts valid product", () => {
    const p = productSchema.parse({ title: "Test", description: "Desc", price: 99, category: "Course" });
    expect(p.title).toBe("Test");
  });

  it("rejects negative price", () => {
    expect(() => productSchema.parse({ title: "T", description: "D", price: -1, category: "C" })).toThrow(ZodError);
  });

  it("allows optional fields", () => {
    const p = productSchema.parse({ title: "T", description: "D", price: 1, category: "C", tags: "a, b", coverImage: "https://img.com/a.png" });
    expect(p.tags).toBe("a, b");
  });
});

describe("orderSchema", () => {
  it("accepts valid order items", () => {
    const o = orderSchema.parse({ items: [{ productId: "abc", price: 29.99, quantity: 2 }] });
    expect(o.items[0].productId).toBe("abc");
    expect(o.items[0].quantity).toBe(2);
  });

  it("rejects empty items", () => {
    expect(() => orderSchema.parse({ items: [] })).toThrow(ZodError);
  });

  it("rejects missing productId", () => {
    expect(() => orderSchema.parse({ items: [{ price: 10 }] })).toThrow(ZodError);
  });
});

describe("bundleSchema", () => {
  it("accepts valid bundle data", () => {
    const b = bundleSchema.parse({ title: "Bundle", description: "Desc", productIds: ["abc", "def"], discount: 0.2 });
    expect(b.discount).toBe(0.2);
  });

  it("defaults discount to undefined when omitted", () => {
    const b = bundleSchema.parse({ title: "Bundle", description: "Desc", productIds: ["abc"] });
    expect(b.discount).toBeUndefined();
  });

  it("rejects discount over 1", () => {
    expect(() => bundleSchema.parse({ title: "B", description: "D", productIds: ["a"], discount: 1.5 })).toThrow(ZodError);
  });
});

describe("checkoutSchema", () => {
  it("accepts valid productId", () => {
    expect(checkoutSchema.parse({ productId: "abc" }).productId).toBe("abc");
  });

  it("rejects empty productId", () => {
    expect(() => checkoutSchema.parse({ productId: "" })).toThrow(ZodError);
  });
});

describe("notificationReadSchema", () => {
  it("accepts with id", () => {
    expect(notificationReadSchema.parse({ id: "abc" }).id).toBe("abc");
  });

  it("accepts without id (mark all read)", () => {
    expect(notificationReadSchema.parse({}).id).toBeUndefined();
  });
});

describe("teamDeleteSchema", () => {
  it("requires both productId and userId", () => {
    expect(teamDeleteSchema.parse({ productId: "a", userId: "b" })).toEqual({ productId: "a", userId: "b" });
  });

  it("rejects missing userId", () => {
    expect(() => teamDeleteSchema.parse({ productId: "a" })).toThrow(ZodError);
  });
});

describe("gamificationSchema", () => {
  it("accepts valid action", () => {
    expect(gamificationSchema.parse({ action: "create_product" }).action).toBe("create_product");
  });

  it("rejects empty action", () => {
    expect(() => gamificationSchema.parse({ action: "" })).toThrow(ZodError);
  });
});
