export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { withErrorHandler, ok, notFound } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth-helpers";

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { productId } = await req.json();
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return notFound("Product not found");
  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{ price_data: { currency: "cny", product_data: { name: product.title, description: product.description }, unit_amount: Math.round(product.price * 100) }, quantity: 1 }],
    mode: "payment",
    success_url: `${process.env.NEXTAUTH_URL}/orders?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/products/${productId}?canceled=true`,
    metadata: { productId, buyerId: user.id },
  });
  return ok({ url: stripeSession.url });
});
