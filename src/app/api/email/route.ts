export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler, validateBody, ok } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth-helpers";
import { emailSchema } from "@/lib/schemas";

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();
  const [subscribers, sentEmails] = await Promise.all([
    prisma.order.findMany({
      where: { items: { some: { product: { sellerId: user.id } } } },
      select: { buyer: { select: { id: true, name: true, email: true } } },
      distinct: ["buyerId"],
    }),
    prisma.emailLog.findMany({
      where: { sellerId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, subject: true, recipientCount: true, status: true, createdAt: true, sentAt: true },
    }),
  ]);
  return ok({
    subscribers: subscribers.map(s => s.buyer).filter(Boolean),
    subscriberCount: subscribers.length,
    sentEmails,
  });
});

interface BuyerInfo { buyer: { email: string; name: string } | null }

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { subject, content, productId } = validateBody(emailSchema, await req.json());
  const buyers = await prisma.order.findMany({
    where: { items: { some: { product: { sellerId: user.id, ...(productId ? { id: productId } : {}) } } } },
    select: { buyer: { select: { email: true, name: true } } },
    distinct: ["buyerId"],
  });
  const recipientEmails = (buyers as unknown as BuyerInfo[]).map(b => b.buyer?.email).filter(Boolean) as string[];

  const emailLog = await prisma.emailLog.create({
    data: {
      sellerId: user.id,
      subject,
      content,
      productId: productId || null,
      recipientCount: recipientEmails.length,
      recipients: JSON.stringify(recipientEmails),
    },
  });

  // In production, integrate with an email provider here:
  // await sendEmails({ to: recipientEmails, subject, html: content });
  // Then update status: await prisma.emailLog.update({ where: { id: emailLog.id }, data: { status: "sent", sentAt: new Date() } });

  return ok({
    queued: true,
    emailId: emailLog.id,
    recipientCount: recipientEmails.length,
    preview: { subject, content: content.slice(0, 100) },
  }, 201);
});
