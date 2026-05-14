export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler, validateBody, ok, badRequest, notFound } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth-helpers";
import { boostSchema } from "@/lib/schemas";

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { productId } = validateBody(boostSchema, await req.json());
  const product = await prisma.product.findFirst({ where: { id: productId, sellerId: user.id } });
  if (!product) return notFound("Product not found");

  const boostFee = 29;
  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  if (!wallet || wallet.balance < boostFee)
    return badRequest(`Insufficient balance. Need ¥${boostFee}`);

  await prisma.wallet.update({ where: { userId: user.id }, data: { balance: { decrement: boostFee } } });
  await prisma.product.update({ where: { id: productId }, data: { updatedAt: new Date() } });
  return ok({ success: true, message: "Product boosted for 7 days", fee: boostFee });
});
