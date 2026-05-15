export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { withErrorHandler, validateBody, ok, badRequest } from "@/lib/api-handler";
import { registerSchema } from "@/lib/schemas";

export const POST = withErrorHandler(async (req) => {
  const { email, password, name } = validateBody(registerSchema, await req.json());
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return badRequest("Email already registered");
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { email, name, passwordHash } });
  await prisma.wallet.create({ data: { userId: user.id, balance: 0 } });
  return ok({ id: user.id, email: user.email, name: user.name });
});
