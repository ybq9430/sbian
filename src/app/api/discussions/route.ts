import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler, validateBody, ok, badRequest } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth-helpers";
import { discussionSchema } from "@/lib/schemas";
export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) return badRequest("productId required");
  const discussions = await prisma.discussion.findMany({
    where: { productId },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      replies: {
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          children: { include: { user: { select: { id: true, name: true, avatar: true } } } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return ok(discussions);
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { productId, title, body } = validateBody(discussionSchema, await req.json());
  const discussion = await prisma.discussion.create({
    data: { title, body, userId: user.id, productId },
    include: { user: { select: { id: true, name: true, avatar: true } }, replies: true },
  });
  return ok(discussion, 201);
});
