import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler, ok } from "@/lib/api-handler";
export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  const [recentOrders, newProducts, recentReviews, newFollowers] = await Promise.all([
    prisma.order.findMany({ take: 10, orderBy: { createdAt: "desc" }, include: { buyer: { select: { id: true, name: true } }, items: { include: { product: { select: { id: true, title: true } } } } } }),
    prisma.product.findMany({ where: { status: "published" }, take: 6, orderBy: { createdAt: "desc" }, include: { seller: { select: { id: true, name: true } } } }),
    prisma.review.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { user: { select: { id: true, name: true } }, product: { select: { id: true, title: true } } } }),
    prisma.follow.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { follower: { select: { id: true, name: true } }, following: { select: { id: true, name: true } } } }),
  ]);

  const activities: any[] = [];
  recentOrders.forEach(o => o.items.forEach(i => activities.push({ type: "purchase", user: o.buyer, product: i.product, price: i.price, date: o.createdAt })));
  newProducts.forEach(p => activities.push({ type: "new_product", product: p, seller: p.seller, date: p.createdAt }));
  recentReviews.forEach(r => activities.push({ type: "review", user: r.user, product: r.product, rating: r.rating, comment: r.comment, date: r.createdAt }));
  newFollowers.forEach(f => activities.push({ type: "follow", follower: f.follower, following: f.following, date: f.createdAt }));

  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return ok(activities.slice(0, 30));
});
