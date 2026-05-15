export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { withErrorHandler, validateBody, ok, notFound } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth-helpers";
import { checkoutSchema } from "@/lib/schemas";

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { productId } = validateBody(checkoutSchema, await req.json());
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return notFound("Product not found");

  const order = await prisma.order.create({
    data: {
      buyerId: user.id,
      total: product.price,
      status: "pending",
      items: { create: [{ productId: product.id, price: product.price, quantity: 1 }] },
    },
  });

  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{ price_data: { currency: "cny", product_data: { name: product.title, description: product.description }, unit_amount: Math.round(product.price * 100) }, quantity: 1 }],
    mode: "payment",
    success_url: `${process.env.NEXTAUTH_URL}/orders?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/checkout/${productId}?canceled=true`,
    metadata: { productId, buyerId: user.id, orderId: order.id },
  });
  return ok({ url: stripeSession.url });
});
