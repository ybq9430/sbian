export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler, ok } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth-helpers";

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
  ]);
  return ok({ notifications, unreadCount });
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { id } = await req.json();
  if (id) {
    await prisma.notification.updateMany({ where: { id, userId: user.id }, data: { read: true } });
  } else {
    await prisma.notification.updateMany({ where: { userId: user.id, read: false }, data: { read: true } });
  }
  return ok({ success: true });
});
