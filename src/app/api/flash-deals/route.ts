import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler, ok } from "@/lib/api-handler";
export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  const now = new Date();
  const deals = await prisma.flashDeal.findMany({
    where: { active: true, endsAt: { gt: now }, startsAt: { lte: now } },
    include: { product: { include: { seller: { select: { id: true, name: true, avatar: true } } } } },
    orderBy: { endsAt: "asc" },
    take: 20,
  });
  return ok(deals.filter(d => d.soldCount < d.maxSales).map(d => ({
    ...d, remaining: d.maxSales - d.soldCount,
    progress: Math.round((d.soldCount / d.maxSales) * 100),
    timeLeft: Math.max(0, Math.floor((new Date(d.endsAt).getTime() - now.getTime()) / 1000)),
  })));
});
