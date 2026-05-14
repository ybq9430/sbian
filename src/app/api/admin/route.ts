export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler, ok } from "@/lib/api-handler";
import { requireAdmin } from "@/lib/auth-helpers";

export const GET = withErrorHandler(async () => {
  await requireAdmin();
  const [users, products, orders, revenue] = await Promise.all([
    prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.product.findMany({ include: { seller: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.order.findMany({ include: { buyer: { select: { name: true, email: true } }, items: { include: { product: { select: { title: true } } } } }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.order.aggregate({ _sum: { total: true } }),
  ]);
  return ok({ users, products, orders, totalRevenue: revenue._sum.total || 0 });
});
