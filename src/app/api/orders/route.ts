export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler, validateBody, ok } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth-helpers";
import { orderSchema } from "@/lib/schemas";

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();
  const orders = await prisma.order.findMany({
    where: { buyerId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  return ok(orders);
});

const PLATFORM_FEE_RATE = Number(process.env.PLATFORM_FEE_RATE) || 0.1;

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { items } = validateBody(orderSchema, await req.json());
  const total = items.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0);

  const order = await prisma.order.create({
    data: {
      buyerId: user.id,
      total,
      items: { create: items.map(i => ({ productId: i.productId, price: i.price, quantity: i.quantity || 1 })) },
    },
    include: { items: { include: { product: true } } },
  });

  const products = await prisma.product.findMany({
    where: { id: { in: items.map(i => i.productId) } },
    select: { id: true, sellerId: true },
  });
  const sellerMap = new Map(products.map(p => [p.id, p.sellerId]));
  const sellerShare = 1 - PLATFORM_FEE_RATE;

  await prisma.$transaction([
    ...items.map(i =>
      prisma.product.update({
        where: { id: i.productId },
        data: { salesCount: { increment: 1 }, revenue: { increment: i.price } },
      })
    ),
    ...items.map(i => {
      const sellerId = sellerMap.get(i.productId);
      if (!sellerId) return prisma.$executeRawUnsafe("SELECT 1");
      const payout = i.price * sellerShare;
      return prisma.wallet.upsert({
        where: { userId: sellerId },
        update: { balance: { increment: payout } },
        create: { userId: sellerId, balance: payout },
      });
    }),
  ]);
  return ok(order, 201);
});
