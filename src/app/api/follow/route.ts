export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler, validateBody, ok, badRequest } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth-helpers";
import { followSchema } from "@/lib/schemas";

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { followingId } = validateBody(followSchema, await req.json());
  if (user.id === followingId) return badRequest("Cannot follow yourself");

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: user.id, followingId } },
  });
  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return ok({ following: false });
  }
  await prisma.follow.create({ data: { followerId: user.id, followingId } });
  return ok({ following: true });
});

export const GET = withErrorHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return badRequest("userId required");
  const [followers, following, followerCount, followingCount] = await Promise.all([
    prisma.follow.findMany({ where: { followingId: userId }, include: { follower: { select: { id: true, name: true, avatar: true } } }, take: 20 }),
    prisma.follow.findMany({ where: { followerId: userId }, include: { following: { select: { id: true, name: true, avatar: true } } }, take: 20 }),
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
  ]);
  return ok({ followers: followers.map(f => f.follower), following: following.map(f => f.following), followerCount, followingCount });
});
