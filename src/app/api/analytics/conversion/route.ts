import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler, validateBody, ok } from "@/lib/api-handler";
import { requireAuth, getSessionUser } from "@/lib/auth-helpers";
import { conversionEventSchema } from "@/lib/schemas";
export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const where: any = productId ? { productId } : { product: { sellerId: user.id } };

  const [events, viewCount, orderCount] = await Promise.all([
    prisma.conversionEvent.findMany({ where, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.conversionEvent.count({ where: { ...where, event: "view" } }),
    prisma.conversionEvent.count({ where: { ...where, event: "purchase" } }),
  ]);

  const views = events.filter(e => e.event === "view").length;
  const cartAdds = events.filter(e => e.event === "add_to_cart").length;
  const checkouts = events.filter(e => e.event === "checkout_start").length;
  const purchases = events.filter(e => e.event === "purchase").length;
  const total = viewCount || views;

  const funnel = [
    { stage: "Views", count: total, pct: 100 },
    { stage: "Add to cart", count: cartAdds, pct: total > 0 ? Math.round((cartAdds / total) * 100) : 0 },
    { stage: "Checkout", count: checkouts, pct: total > 0 ? Math.round((checkouts / total) * 100) : 0 },
    { stage: "Purchases", count: orderCount || purchases, pct: total > 0 ? Math.round(((orderCount || purchases) / total) * 100) : 0 },
  ];
  const sources = events.filter(e => e.source).reduce((acc: Record<string, number>, e) => { acc[e.source!] = (acc[e.source!] || 0) + 1; return acc; }, {});

  return ok({ funnel, sources, totalViews: total, totalConversions: orderCount || purchases, conversionRate: total > 0 ? ((orderCount / total) * 100).toFixed(2) + "%" : "0%" });
});

export const POST = withErrorHandler(async (req) => {
  const { productId, event, source, value } = validateBody(conversionEventSchema, await req.json());
  if (event === "view" && productId) await prisma.product.update({ where: { id: productId }, data: { viewCount: { increment: 1 } } });
  const user = await getSessionUser();
  return ok(await prisma.conversionEvent.create({ data: { productId, event, source: source || "direct", value: value || null, userId: user?.id || null } }), 201);
});
