import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { withErrorHandler, ok } from "@/lib/api-handler";
export const dynamic = "force-dynamic";

function safeFloat(v: string | null, fallback: number): number {
  if (!v) return fallback;
  const n = parseFloat(v);
  return Number.isNaN(n) ? fallback : n;
}

export const GET = withErrorHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category");
  const minPrice = safeFloat(searchParams.get("minPrice"), 0);
  const maxPrice = safeFloat(searchParams.get("maxPrice"), 999999);
  const sort = searchParams.get("sort") || "relevance";
  const rating = parseInt(searchParams.get("rating") || "0");
  const tags = searchParams.get("tags")?.split(",").filter(Boolean) || [];

  const where: Prisma.ProductWhereInput = { status: "published", price: { gte: minPrice, lte: maxPrice } };
  if (category) where.category = category;
  if (rating > 0) where.rating = { gte: rating };
  if (q) where.OR = [{ title: { contains: q } }, { description: { contains: q } }, { tags: { contains: q } }];
  if (tags.length > 0) where.tags = { contains: tags[0] };

  const orderBy: Prisma.ProductOrderByWithRelationInput = sort === "price_asc" ? { price: "asc" } : sort === "price_desc" ? { price: "desc" } : sort === "best_selling" ? { salesCount: "desc" } : sort === "top_rated" ? { rating: "desc" } : { createdAt: "desc" };

  const [products, total, categoryGroups, allTags] = await Promise.all([
    prisma.product.findMany({ where, include: { seller: { select: { id: true, name: true, avatar: true } } }, orderBy, take: 24 }),
    prisma.product.count({ where }),
    prisma.product.groupBy({ by: ["category"], where: { status: "published" } }),
    prisma.product.findMany({ where: { status: "published" }, select: { tags: true }, take: 200 }),
  ]);

  return ok({
    products, total,
    facets: {
      categories: categoryGroups.map(c => c.category).filter(Boolean),
      tags: [...new Set(allTags.flatMap(p => p.tags?.split(", ").filter(Boolean) || []))].slice(0, 20),
      priceRange: { min: 0, max: Math.max(...products.map(p => p.price), 100) },
    },
    query: q,
  });
});
