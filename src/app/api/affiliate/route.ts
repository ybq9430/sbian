export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler, ok } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth-helpers";

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();
  let affiliate = await prisma.affiliate.findUnique({ where: { userId: user.id } });
  if (!affiliate) {
    const code = `REF-${user.id.slice(0, 8).toUpperCase()}`;
    affiliate = await prisma.affiliate.create({ data: { userId: user.id, code } });
  }
  return ok(affiliate);
});
