import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler, ok } from "@/lib/api-handler";
export const dynamic = "force-dynamic";

interface ActivityItem {
  type: "purchase" | "new_product" | "review" | "follow";
  date: Date;
  [key: string]: unknown;
}

export const GET = withErrorHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(5, parseInt(searchParams.get("limit") || "20")));
  // Fetch enough from each category to cover the page window
  const fetchCount = page * limit + limit;

  const [recentOrders, newProducts, recentReviews, newFollowers] = await Promise.all([
    prisma.order.findMany({ take: fetchCount, orderBy: { createdAt: "desc" }, include: { buyer: { select: { id: true, name: true } }, items: { include: { product: { select: { id: true, title: true } } } } } }),
    prisma.product.findMany({ where: { status: "published" }, take: fetchCount, orderBy: { createdAt: "desc" }, include: { seller: { select: { id: true, name: true } } } }),
    prisma.review.findMany({ take: fetchCount, orderBy: { createdAt: "desc" }, include: { user: { select: { id: true, name: true } }, product: { select: { id: true, title: true } } } }),
    prisma.follow.findMany({ take: fetchCount, orderBy: { createdAt: "desc" }, include: { follower: { select: { id: true, name: true } }, following: { select: { id: true, name: true } } } }),
  ]);

  const activities: ActivityItem[] = [];
  recentOrders.forEach(o => o.items.forEach(i => activities.push({ type: "purchase" as const, user: o.buyer, product: i.product, price: i.price, date: o.createdAt })));
  newProducts.forEach(p => activities.push({ type: "new_product" as const, product: p, seller: p.seller, date: p.createdAt }));
  recentReviews.forEach(r => activities.push({ type: "review" as const, user: r.user, product: r.product, rating: r.rating, comment: r.comment, date: r.createdAt }));
  newFollowers.forEach(f => activities.push({ type: "follow" as const, follower: f.follower, following: f.following, date: f.createdAt }));

  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const start = (page - 1) * limit;
  return ok({ activities: activities.slice(start, start + limit), page, hasMore: activities.length > start + limit });
});
