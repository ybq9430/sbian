export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler, validateBody, ok, notFound } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth-helpers";
import { abTestSchema } from "@/lib/schemas";

export const GET = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const tests = await prisma.aBTest.findMany({
    where: productId ? { productId, product: { sellerId: user.id } } : { product: { sellerId: user.id } },
    include: { variants: true, product: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
  });
  return ok(tests);
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { productId, name, traffic, variants } = validateBody(abTestSchema, await req.json());
  const product = await prisma.product.findFirst({ where: { id: productId, sellerId: user.id } });
  if (!product) return notFound("Product not found");
  const test = await prisma.aBTest.create({
    data: { productId, name, traffic: traffic || 0.5, variants: { create: variants } },
    include: { variants: true },
  });
  return ok(test, 201);
});
