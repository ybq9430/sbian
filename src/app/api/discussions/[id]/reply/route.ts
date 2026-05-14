export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler, validateBody, ok } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth-helpers";
import { replySchema } from "@/lib/schemas";

export const POST = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { body, parentId } = validateBody(replySchema, await req.json());
  const reply = await prisma.reply.create({
    data: { body, userId: user.id, discussionId: params.id, parentId: parentId || null },
    include: { user: { select: { id: true, name: true, avatar: true } }, children: true },
  });
  return ok(reply, 201);
});
