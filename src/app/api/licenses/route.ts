export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { withErrorHandler, validateBody, ok, notFound } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth-helpers";
import { licenseGenSchema } from "@/lib/schemas";

function generateKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  ).join("-");
}

export const GET = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const keys = await prisma.licenseKey.findMany({
    where: productId ? { productId, product: { sellerId: user.id } } : { product: { sellerId: user.id } },
    include: { product: { select: { title: true } } },
    orderBy: { createdAt: "desc" }, take: 100,
  });
  return ok(keys);
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { productId, count } = validateBody(licenseGenSchema, await req.json());
  const product = await prisma.product.findFirst({ where: { id: productId, sellerId: user.id } });
  if (!product) return notFound("Product not found");
  const keys = Array.from({ length: count || 1 }, () => ({
    key: generateKey(),
    productId,
    status: "available" as const,
  }));
  // Create keys individually within a transaction so we can return them directly
  const created = await prisma.$transaction(
    keys.map(k => prisma.licenseKey.create({ data: k }))
  );
  return ok({ generated: created.length, keys: created });
});
