export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler, validateBody, ok, badRequest } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth-helpers";
import { crmNoteSchema } from "@/lib/schemas";

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();
  const [customers, segments, notes, totalRevenue] = await Promise.all([
    prisma.order.findMany({ where: { items: { some: { product: { sellerId: user.id } } } }, select: { buyer: { select: { id: true, name: true, email: true, createdAt: true } }, total: true, createdAt: true }, distinct: ["buyerId"], orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.customerSegment.findMany({ where: { sellerId: user.id } }),
    prisma.customerNote.findMany({ where: { sellerId: user.id }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.order.aggregate({ where: { items: { some: { product: { sellerId: user.id } } } }, _sum: { total: true } }),
  ]);

  const customerMap = new Map<string, { customer: any; totalSpent: number; orderCount: number; lastOrder: Date }>();
  customers.forEach(o => {
    const c = o.buyer;
    const existing = customerMap.get(c.id);
    if (existing) { existing.totalSpent += o.total; existing.orderCount += 1; if (new Date(o.createdAt) > existing.lastOrder) existing.lastOrder = new Date(o.createdAt); }
    else customerMap.set(c.id, { customer: c, totalSpent: o.total, orderCount: 1, lastOrder: new Date(o.createdAt) });
  });
  return ok({
    customers: [...customerMap.values()].sort((a, b) => b.totalSpent - a.totalSpent),
    totalCustomers: customerMap.size, totalRevenue: totalRevenue._sum.total || 0, segments, notes,
  });
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { type, userId, note, name, criteria } = validateBody(crmNoteSchema, await req.json());
  if (type === "note") return ok(await prisma.customerNote.create({ data: { userId: userId!, sellerId: user.id, note: note! } }), 201);
  if (type === "segment") return ok(await prisma.customerSegment.create({ data: { sellerId: user.id, name: name!, criteria: JSON.stringify(criteria) } }), 201);
  return badRequest("Invalid type");
});
