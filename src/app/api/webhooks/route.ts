export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { withErrorHandler, validateBody, ok } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth-helpers";
import { webhookSchema, deleteIdSchema } from "@/lib/schemas";

function generateSecret(): string { return "whsec_" + crypto.randomBytes(16).toString("hex"); }

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();
  return ok(await prisma.webhookEndpoint.findMany({
    where: { userId: user.id }, include: { deliveries: { take: 5, orderBy: { createdAt: "desc" } } }, orderBy: { createdAt: "desc" },
  }));
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { url, events } = validateBody(webhookSchema, await req.json());
  const secret = generateSecret();
  return ok({ ...await prisma.webhookEndpoint.create({ data: { userId: user.id, url, events: events || "sale,refund", secret } }), signingSecret: secret }, 201);
});

export const DELETE = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { id } = validateBody(deleteIdSchema, await req.json());
  await prisma.webhookEndpoint.deleteMany({ where: { id, userId: user.id } });
  return ok({ success: true });
});
