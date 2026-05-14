export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { withErrorHandler, validateBody, ok } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth-helpers";
import { apiKeySchema, deleteIdSchema } from "@/lib/schemas";

function generateApiKey(): string { return "sk_" + crypto.randomBytes(24).toString("hex"); }

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();
  return ok(await prisma.apiKey.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }));
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { name, scopes } = validateBody(apiKeySchema, await req.json());
  const key = generateApiKey();
  const apiKey = await prisma.apiKey.create({ data: { userId: user.id, name, key, scopes: scopes || "read", rateLimit: 100 } });
  return ok({ id: apiKey.id, name: apiKey.name, fullKey: key, scopes: apiKey.scopes, createdAt: apiKey.createdAt }, 201);
});

export const DELETE = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { id } = validateBody(deleteIdSchema, await req.json());
  await prisma.apiKey.deleteMany({ where: { id, userId: user.id } });
  return ok({ success: true });
});
