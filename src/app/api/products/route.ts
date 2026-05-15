export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { withErrorHandler, validateBody, ok } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth-helpers";
import { productSchema } from "@/lib/schemas";

export const GET = withErrorHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12")));
  const where: Prisma.ProductWhereInput = { status: "published" };
  if (category) where.category = category;
  if (search) where.title = { contains: search };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where, skip: (page - 1) * limit, take: limit,
      orderBy: { createdAt: "desc" },
      include: { seller: { select: { id: true, name: true, avatar: true } } },
    }),
    prisma.product.count({ where }),
  ]);
  return ok({ products, total, page, totalPages: Math.ceil(total / limit) });
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const data = validateBody(productSchema, await req.json());
  const product = await prisma.product.create({ data: { ...data, sellerId: user.id } });
  return ok(product, 201);
});
