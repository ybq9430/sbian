export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler, validateBody, ok, notFound } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth-helpers";
import { subscriptionSchema } from "@/lib/schemas";

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();
  const [mySubscriptions, plansSold] = await Promise.all([
    prisma.userSubscription.findMany({ where: { userId: user.id }, include: { plan: { include: { product: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.subscriptionPlan.findMany({ where: { product: { sellerId: user.id } }, include: { subscriptions: { include: { user: { select: { id: true, name: true, email: true } } } }, product: true } }),
  ]);
  return ok({ mySubscriptions, plansSold });
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { productId, interval, intervalCount, trialDays } = validateBody(subscriptionSchema, await req.json());
  const product = await prisma.product.findFirst({ where: { id: productId, sellerId: user.id } });
  if (!product) return notFound("Product not found");
  const plan = await prisma.subscriptionPlan.upsert({
    where: { productId },
    update: { interval: interval || "month", intervalCount: intervalCount || 1, trialDays: trialDays || 0 },
    create: { productId, interval: interval || "month", intervalCount: intervalCount || 1, trialDays: trialDays || 0 },
  });
  return ok(plan);
});
