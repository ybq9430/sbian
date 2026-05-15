import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler, ok } from "@/lib/api-handler";
import { getSessionUser } from "@/lib/auth-helpers";
export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const limit = Math.min(12, Math.max(1, parseInt(searchParams.get("limit") || "6")));

  if (productId) {
    const buyersOfThis = await prisma.orderItem.findMany({ where: { productId }, select: { order: { select: { buyerId: true } } } });
    const buyerIds = [...new Set(buyersOfThis.map(b => b.order?.buyerId).filter(Boolean))];
    if (buyerIds.length > 0) {
      const relatedItems = await prisma.orderItem.findMany({
        where: { order: { buyerId: { in: buyerIds } }, productId: { not: productId } },
        include: { product: { include: { seller: { select: { id: true, name: true } } } } },
        take: limit * 2,
      });
      const scored = new Map<string, { product: typeof relatedItems[number]["product"]; count: number }>();
      relatedItems.forEach(item => { const e = scored.get(item.productId); if (e) e.count++; else scored.set(item.productId, { product: item.product, count: 1 }); });
      return ok([...scored.values()].sort((a, b) => b.count - a.count).slice(0, limit).map(s => ({ ...s.product, reason: `Also bought by ${s.count} customer(s)` })));
    }
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { category: true } });
    const sameCategory = await prisma.product.findMany({ where: { category: product?.category, id: { not: productId }, status: "published" }, include: { seller: { select: { id: true, name: true } } }, take: limit, orderBy: { salesCount: "desc" } });
    return ok(sameCategory.map(p => ({ ...p, reason: "Similar category" })));
  }

  const user = await getSessionUser();
  if (user) {
    const userOrders = await prisma.orderItem.findMany({ where: { order: { buyerId: user.id } }, select: { product: { select: { category: true } } } });
    const categories = [...new Set(userOrders.map(o => o.product?.category).filter(Boolean))];
    if (categories.length > 0) {
      const personalized = await prisma.product.findMany({ where: { category: { in: categories }, status: "published" }, include: { seller: { select: { id: true, name: true } } }, take: limit, orderBy: { salesCount: "desc" } });
      if (personalized.length > 0) return ok(personalized.map(p => ({ ...p, reason: "Based on your interests" })));
    }
  }
  const trending = await prisma.product.findMany({ where: { status: "published" }, include: { seller: { select: { id: true, name: true } } }, take: limit, orderBy: { salesCount: "desc" } });
  return ok(trending.map(p => ({ ...p, reason: "Trending" })));
});
