export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { withErrorHandler, ok } from "@/lib/api-handler";

export const POST = withErrorHandler(async (req) => {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) throw new Error("Missing stripe-signature header");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET not configured");

  const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "paid", stripePaymentId: session.id },
        });
      }
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "cancelled" },
        });
      }
      break;
    }
  }

  return ok({ received: true });
});
