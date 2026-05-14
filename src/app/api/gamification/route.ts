export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler, validateBody, ok } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth-helpers";
import { gamificationSchema } from "@/lib/schemas";

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();
  const [userData, allBadges, userBadges] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { xp: true, level: true } }),
    prisma.badge.findMany(),
    prisma.userBadge.findMany({ where: { userId: user.id }, include: { badge: true } }),
  ]);
  const xpForNextLevel = (userData!.level) * 500;
  return ok({
    xp: userData?.xp || 0, level: userData?.level || 1,
    xpForNextLevel, xpProgress: Math.round(((userData?.xp || 0) / xpForNextLevel) * 100),
    allBadges, earnedBadges: userBadges.map(ub => ub.badge),
  });
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { action } = validateBody(gamificationSchema, await req.json());
  const xpMap: Record<string, number> = { create_product: 50, make_sale: 30, write_review: 10, daily_login: 5, share_product: 15, refer_friend: 100, complete_profile: 25 };
  const xp = xpMap[action] || 0;
  if (xp > 0) {
    const updated = await prisma.user.update({ where: { id: user.id }, data: { xp: { increment: xp } } });
    const newLevel = Math.floor(updated.xp / 500) + 1;
    if (newLevel > updated.level) await prisma.user.update({ where: { id: user.id }, data: { level: newLevel } });
  }
  return ok({ xpEarned: xp });
});
