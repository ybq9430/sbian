export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler, validateBody, ok, notFound, badRequest } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth-helpers";
import { teamSchema, teamDeleteSchema } from "@/lib/schemas";

export const GET = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (productId) {
    return ok(await prisma.teamMember.findMany({ where: { productId }, include: { user: { select: { id: true, name: true, email: true, avatar: true } } } }));
  }
  return ok(await prisma.teamMember.findMany({ where: { userId: user.id }, include: { product: { select: { id: true, title: true, salesCount: true, revenue: true } } } }));
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { productId, email, role } = validateBody(teamSchema, await req.json());
  const product = await prisma.product.findFirst({ where: { id: productId, sellerId: user.id } });
  if (!product) return notFound("Product not found");
  const teammate = await prisma.user.findUnique({ where: { email } });
  if (!teammate) return badRequest("User not found");
  const member = await prisma.teamMember.create({
    data: { userId: teammate.id, productId, role: role || "editor" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return ok(member, 201);
});

export const DELETE = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { productId, userId } = validateBody(teamDeleteSchema, await req.json());
  await prisma.teamMember.deleteMany({ where: { productId, userId, product: { sellerId: user.id } } });
  return ok({ success: true });
});
