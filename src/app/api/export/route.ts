import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler, badRequest } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth-helpers";
export const dynamic = "force-dynamic";

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(","), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? "")).join(","))];
  return lines.join("\n");
}

export const GET = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "orders";

  let csv = "";
  let filename = "";

  if (type === "orders") {
    const orders = await prisma.order.findMany({ where: { buyerId: user.id }, include: { items: { include: { product: true } } }, orderBy: { createdAt: "desc" } });
    csv = toCSV(orders.map(o => ({ id: o.id, total: o.total, status: o.status, items: o.items.map(i => i.product?.title).join("; "), date: o.createdAt.toISOString() })));
    filename = "orders.csv";
  } else if (type === "customers") {
    const customers = await prisma.order.findMany({ where: { items: { some: { product: { sellerId: user.id } } } }, select: { buyer: { select: { name: true, email: true } }, total: true, createdAt: true }, distinct: ["buyerId"], orderBy: { createdAt: "desc" } });
    csv = toCSV(customers.map(o => ({ name: o.buyer.name, email: o.buyer.email, spent: o.total, lastOrder: o.createdAt.toISOString() })));
    filename = "customers.csv";
  } else if (type === "products") {
    const products = await prisma.product.findMany({ where: { sellerId: user.id }, orderBy: { createdAt: "desc" } });
    csv = toCSV(products.map(p => ({ id: p.id, title: p.title, price: p.price, category: p.category, sales: p.salesCount, revenue: p.revenue, rating: p.rating, status: p.status, created: p.createdAt.toISOString() })));
    filename = "products.csv";
  } else {
    return badRequest("Invalid type. Use: orders, customers, products");
  }

  return new NextResponse(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="${filename}"` } });
});
