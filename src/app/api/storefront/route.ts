import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler, validateBody, ok, badRequest, notFound } from "@/lib/api-handler";
import { requireAuth, getSessionUser } from "@/lib/auth-helpers";
import { storefrontSchema } from "@/lib/schemas";
export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const subdomain = searchParams.get("subdomain");
  const userId = searchParams.get("userId");
  const where: any = { published: true };
  if (subdomain) where.subdomain = subdomain;
  if (userId) where.userId = userId;

  if (subdomain || userId) {
    const storefront = await prisma.storefront.findFirst({ where, include: { user: { select: { id: true, name: true, bio: true, avatar: true } } } });
    if (!storefront) return notFound("Storefront not found");
    const products = await prisma.product.findMany({ where: { sellerId: storefront.userId, status: "published" }, orderBy: { salesCount: "desc" } });
    return ok({ ...storefront, products });
  }
  return ok(await prisma.storefront.findMany({ where: { published: true }, include: { user: { select: { id: true, name: true } } }, take: 20 }));
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { subdomain, title, description, theme, logoUrl } = validateBody(storefrontSchema, await req.json());
  const existing = await prisma.storefront.findUnique({ where: { subdomain } });
  if (existing && existing.userId !== user.id) return badRequest("Subdomain taken");
  const storefront = await prisma.storefront.upsert({
    where: { userId: user.id },
    update: { subdomain, title, description: description || "", theme: theme || "default", logoUrl, published: true },
    create: { userId: user.id, subdomain, title, description: description || "", theme: theme || "default", logoUrl, published: true },
  });
  return ok(storefront);
});
