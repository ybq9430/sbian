export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler, validateBody, ok } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth-helpers";
import { bundleSchema } from "@/lib/schemas";

export const GET = withErrorHandler(async () => {
  const bundles = await prisma.bundle.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  return ok(bundles.map(b => {
    const originalPrice = b.items.reduce((sum, i) => sum + i.product.price, 0);
    return { ...b, originalPrice, savings: originalPrice - b.price };
  }));
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { title, description, productIds, discount = 0 } = validateBody(bundleSchema, await req.json());
  const products = await prisma.product.findMany({ where: { id: { in: productIds }, sellerId: user.id } });
  const totalPrice = products.reduce((sum, p) => sum + p.price, 0);
  const bundlePrice = Math.round(totalPrice * (1 - discount) * 100) / 100;
  const bundle = await prisma.bundle.create({
    data: { title, description, price: bundlePrice, discount, sellerId: user.id, items: { create: productIds.map((pid: string) => ({ productId: pid })) } },
    include: { items: { include: { product: true } } },
  });
  return ok(bundle, 201);
});
