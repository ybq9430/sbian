export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler, ok, notFound } from "@/lib/api-handler";

export const GET = withErrorHandler(async (_req, { params }) => {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      seller: { select: { id: true, name: true, avatar: true } },
      reviews: { include: { user: { select: { id: true, name: true, avatar: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!product) return notFound("Product not found");
  return ok(product);
});
