export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler, ok } from "@/lib/api-handler";
import { requireAuth, getSessionUser, AuthError } from "@/lib/auth-helpers";

export const GET = withErrorHandler(async () => {
  const user = await getSessionUser();
  if (!user) throw new AuthError("Unauthorized");

  if (user.role === "admin") {
    const [totalUsers, totalProducts, totalOrders, totalRevenue, recentOrders] = await Promise.all([
      prisma.user.count(), prisma.product.count(), prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.order.findMany({ take: 10, orderBy: { createdAt: "desc" }, include: { buyer: { select: { name: true, email: true } } } }),
    ]);
    const monthlyOrders = await prisma.order.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      select: { total: true, createdAt: true },
    });
    return ok({ totalUsers, totalProducts, totalOrders, totalRevenue: totalRevenue._sum.total || 0, recentOrders, monthlyOrders });
  }

  const [myProducts, myOrders, productRevenue, walletBalance] = await Promise.all([
    prisma.product.count({ where: { sellerId: user.id } }),
    prisma.order.count({ where: { buyerId: user.id } }),
    prisma.product.aggregate({ where: { sellerId: user.id }, _sum: { revenue: true, salesCount: true } }),
    prisma.wallet.findUnique({ where: { userId: user.id } }),
  ]);
  return ok({
    myProducts, myOrders,
    totalRevenue: productRevenue._sum.revenue || 0,
    totalSales: productRevenue._sum.salesCount || 0,
    walletBalance: walletBalance?.balance || 0,
  });
});
