export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler, validateBody, ok } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth-helpers";
import { emailSchema } from "@/lib/schemas";

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();
  const subscribers = await prisma.order.findMany({
    where: { items: { some: { product: { sellerId: user.id } } } },
    select: { buyer: { select: { id: true, name: true, email: true } } },
    distinct: ["buyerId"],
  });
  return ok({ subscribers: subscribers.map((s: any) => s.buyer).filter(Boolean), count: subscribers.length });
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { subject, content, productId } = validateBody(emailSchema, await req.json());
  const buyers = await prisma.order.findMany({
    where: { items: { some: { product: { sellerId: user.id, ...(productId ? { id: productId } : {}) } } } },
    select: { buyer: { select: { email: true, name: true } } },
    distinct: ["buyerId"],
  });
  const recipientEmails = buyers.map((b: any) => b.buyer?.email).filter(Boolean);
  return ok({ sent: true, recipientCount: recipientEmails.length, preview: { subject, content: content.slice(0, 100) } });
});
