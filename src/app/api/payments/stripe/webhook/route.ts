import { db } from "@/lib/db";
import { stripe } from "@/lib/payments/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature") || "";
  const body = await req.text();
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      `${process.env.STRIPE_ENDPOINT_SECRET}`
    );
  } catch (err) {
    console.error("Webhook Error:", err);
    return new NextResponse(`Webhook Error: ${err}`, { status: 400 });
  }
  if (event.type === "payment_intent.succeeded") {
    // Handle successful checkout session
    const payment = event.data.object;
    // Save the checkout session data to the database
    await db.transaction.updateMany({
      where: { gatewayTransactionId: payment.id as string },
      data: {
        status: payment.status == "succeeded" ? "SUCCESS" : "FAILED",
      },
    });
  } else if (event.type === "invoice.payment_succeeded") {
    // Handle successful invoice payment
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;
    // Update subscription in the database
    await db.subscription.updateMany({
      where: { gatewaySubscriptionId: subscriptionId?.toString() },
      data: {
        currentPeriodEnd: new Date(invoice.lines.data[0].period.end * 1000),
        status: invoice.status == "paid" ? "ACTIVE" : "CANCELED",
        currentPeriodStart: new Date(invoice.lines.data[0].period.start * 1000),
        usedQuantity: 0,
      },
    });
  } else if (event.type === "invoice.payment_failed") {
    // Handle failed invoice payment
    const failedInvoice = event.data.object;
    const failedSubscriptionId = failedInvoice.subscription as string;
    // Update subscription status in the database
    await db.subscription.updateMany({
      where: { gatewaySubscriptionId: failedSubscriptionId },
      data: {
        status: "CANCELED",
      },
    });
  } else if (event.type === "customer.subscription.deleted") {
    // Handle subscription cancellation
    const deletedSubscription = event.data.object;
    // Update subscription status in the database
    await db.subscription.updateMany({
      where: { gatewaySubscriptionId: deletedSubscription.id },
      data: {
        status: "CANCELED",
      },
    });
  }
  return new NextResponse(
    JSON.stringify({
      recived: true,
    }),
    { status: 200 }
  );
}
