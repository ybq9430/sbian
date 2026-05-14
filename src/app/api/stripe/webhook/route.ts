export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { withErrorHandler, ok } from "@/lib/api-handler";

export const POST = withErrorHandler(async (req) => {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;
  const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder");
  if (event.type === "checkout.session.completed") {
    const data = event.data.object as any;
    await prisma.order.updateMany({ where: { stripePaymentId: data.id }, data: { status: "completed" } });
  }
  return ok({ received: true });
});
