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

  for (const item of items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { salesCount: { increment: 1 }, revenue: { increment: item.price } },
    });
    await prisma.wallet.upsert({
      where: { userId: user.id },
      update: { balance: { increment: item.price * 0.9 } },
      create: { userId: user.id, balance: item.price * 0.9 },
    });
  }
  return ok(order, 201);
});
