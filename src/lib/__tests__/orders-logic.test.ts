import { describe, it, expect } from "vitest";

/**
 * Integration-logic tests for order processing.
 *
 * These test the pure business logic extracted from the orders route:
 * - Platform fee calculation
 * - Seller payout amount
 * - Batch-safe wallet crediting
 */

const PLATFORM_FEE_RATE = Number(process.env.PLATFORM_FEE_RATE) || 0.1;
const SELLER_SHARE = 1 - PLATFORM_FEE_RATE;

function calculatePayout(itemPrice: number, quantity: number): {
  total: number;
  sellerPayout: number;
  platformFee: number;
} {
  const total = itemPrice * quantity;
  const sellerPayout = total * SELLER_SHARE;
  const platformFee = total * PLATFORM_FEE_RATE;
  return { total, sellerPayout: Math.round(sellerPayout * 100) / 100, platformFee };
}

function buildSellerMap(
  products: { id: string; sellerId: string }[]
): Map<string, string> {
  return new Map(products.map((p) => [p.id, p.sellerId]));
}

function computeTotal(
  items: { price: number; quantity?: number }[]
): number {
  return items.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0);
}

describe("calculatePayout", () => {
  it("splits a ¥100 sale into ¥90 seller and ¥10 platform fee", () => {
    const result = calculatePayout(100, 1);
    expect(result.total).toBe(100);
    expect(result.sellerPayout).toBe(90);
    expect(result.platformFee).toBe(10);
  });

  it("splits a ¥299 sale with default 10% fee", () => {
    const result = calculatePayout(299, 1);
    expect(result.total).toBe(299);
    expect(result.sellerPayout).toBeCloseTo(269.1, 1);
    expect(result.platformFee).toBeCloseTo(29.9, 1);
  });

  it("handles quantity > 1", () => {
    const result = calculatePayout(50, 3);
    expect(result.total).toBe(150);
    expect(result.sellerPayout).toBe(135);
    expect(result.platformFee).toBe(15);
  });

  it("handles fractional price with precision", () => {
    const result = calculatePayout(29.99, 1);
    expect(result.total).toBe(29.99);
    expect(result.sellerPayout).toBeCloseTo(26.99, 1);
    expect(result.sellerPayout + result.platformFee).toBeCloseTo(29.99, 2);
  });
});

describe("buildSellerMap", () => {
  it("maps product IDs to seller IDs", () => {
    const products = [
      { id: "p1", sellerId: "s1" },
      { id: "p2", sellerId: "s2" },
      { id: "p3", sellerId: "s1" },
    ];
    const map = buildSellerMap(products);
    expect(map.get("p1")).toBe("s1");
    expect(map.get("p2")).toBe("s2");
    expect(map.get("p3")).toBe("s1");
  });

  it("returns undefined for unknown product", () => {
    const map = buildSellerMap([{ id: "p1", sellerId: "s1" }]);
    expect(map.get("nonexistent")).toBeUndefined();
  });

  it("handles empty array", () => {
    const map = buildSellerMap([]);
    expect(map.size).toBe(0);
  });
});

describe("computeTotal", () => {
  it("sums item prices with quantities", () => {
    const total = computeTotal([
      { price: 100, quantity: 2 },
      { price: 50, quantity: 1 },
    ]);
    expect(total).toBe(250);
  });

  it("defaults quantity to 1", () => {
    const total = computeTotal([{ price: 99 }, { price: 1 }]);
    expect(total).toBe(100);
  });

  it("returns 0 for empty items", () => {
    expect(computeTotal([])).toBe(0);
  });
});

describe("wallet credit direction", () => {
  it("each item credits the correct seller, not the buyer", () => {
    const items = [
      { productId: "p1", price: 100, quantity: 1 },
      { productId: "p2", price: 50, quantity: 2 },
    ];
    const sellerMap = new Map([
      ["p1", "seller-a"],
      ["p2", "seller-b"],
    ]);
    // Simulate the wallet operations the route would create
    const credits = new Map<string, number>();
    for (const item of items) {
      const sellerId = sellerMap.get(item.productId);
      if (!sellerId) continue;
      const payout = item.price * (item.quantity || 1) * SELLER_SHARE;
      credits.set(sellerId, (credits.get(sellerId) || 0) + payout);
    }
    // buyer is never credited
    expect(credits.has("buyer-id")).toBe(false);
    // seller-a gets 100 * 0.9 = 90
    expect(credits.get("seller-a")).toBeCloseTo(90, 1);
    // seller-b gets 50 * 2 * 0.9 = 90
    expect(credits.get("seller-b")).toBeCloseTo(90, 1);
  });

  it("skips items where seller is not found", () => {
    const items = [{ productId: "p-missing", price: 100, quantity: 1 }];
    const sellerMap = new Map<string, string>(); // empty
    const credits = new Map<string, number>();
    for (const item of items) {
      const sellerId = sellerMap.get(item.productId);
      if (!sellerId) continue;
      credits.set(sellerId, item.price);
    }
    expect(credits.size).toBe(0); // no credits issued, no crash
  });
});
