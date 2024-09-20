import { db } from "@/lib/db";
import { stripe } from "@/lib/payments/stripe";
import { NextRequest, NextResponse } from "next/server";
const slep = (time: number) =>
  new Promise((resolve, reject) => setTimeout(resolve, time));
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
    const paymentIntent = event.data.object;
    const metadata = paymentIntent.metadata as {
      pricingId: string;
      userId: string;
      maxQuantity: string;
      mode: "payment" | "subscription";
    };
    if (metadata.mode === "payment")
      if (metadata)
        await db.payment.create({
          data: {
            amount: paymentIntent.amount as number,
            currency: paymentIntent.currency as string,
            gateway: "STRIPE",
            status:
              paymentIntent.status == "succeeded"
                ? "SUCCESS"
                : paymentIntent.status == "processing"
                ? "PENDING"
                : "FAILED",
            maxQuantity: Number(metadata.maxQuantity) || 0,
            type: "ONE_TIME",
            gatewayPaymentId: paymentIntent.id as string,
            pricingId: metadata.pricingId,
            userId: metadata.userId,
          },
        });
  } else if (event.type === "customer.subscription.updated") {
    const ev = await stripe.events.retrieve(event.id);
    // Handle subscription update
    const updatedSubscription = event.data.object;
    // Update subscription status in the database
    const metadata = updatedSubscription.metadata as {
      pricingId: string;
      userId: string;
      maxQuantity: string;
    };
    const pricing = await stripe.prices.retrieve(
      updatedSubscription.items.data[0].price.id
    );
    const ownPricing = await db.pricing.findFirst({
      where: {
        price: (pricing.unit_amount as number) / 100,
        plan: {
          isNot: null,
        },
      },
    });
    if (metadata && ownPricing) {
      await slep(500);
      const prevAmount =
        event.data.previous_attributes?.items?.data[0].plan.amount || 0;

      const currentAmount = event.data.object.items.data[0].plan.amount || 0;
      const prevStatus = event.data.previous_attributes?.status;
      await db.subscription.upsert({
        where: {
          gatewaySubscriptionId_gateway: {
            gatewaySubscriptionId: updatedSubscription.id,
            gateway: "STRIPE",
          },
        },
        create: {
          status:
            updatedSubscription.status == "active"
              ? "ACTIVE"
              : updatedSubscription.status == "paused"
              ? "PAUSED"
              : updatedSubscription.status == "incomplete"
              ? "INCOMPLETE"
              : "CANCELED",
          currentPeriodEnd: new Date(
            updatedSubscription.current_period_end * 1000
          ),
          currentPeriodStart: new Date(
            updatedSubscription.current_period_start * 1000
          ),
          gatewaySubscriptionId: updatedSubscription.id,
          maxQuantity: Number(ownPricing.maxQuantity),
          gateway: "STRIPE",
          userId: metadata.userId,
          pricingId: ownPricing.id,
        },
        update: {
          status:
            updatedSubscription.status == "active"
              ? "ACTIVE"
              : updatedSubscription.status == "paused"
              ? "PAUSED"
              : updatedSubscription.status == "incomplete"
              ? "INCOMPLETE"
              : "CANCELED",
          currentPeriodEnd: new Date(
            updatedSubscription.current_period_end * 1000
          ),
          currentPeriodStart: new Date(
            updatedSubscription.current_period_start * 1000
          ),
          gatewaySubscriptionId: updatedSubscription.id,
          maxQuantity: !prevStatus
            ? prevAmount >= currentAmount
              ? undefined
              : event.data.previous_attributes?.cancellation_details
              ? undefined
              : Number(ownPricing.maxQuantity)
            : Number(ownPricing.maxQuantity),
          pricingId: ownPricing.id,
          usedQuantity: !event.data.previous_attributes?.status ? undefined : 0,
        },
      });
    }
  } else if (event.type === "customer.subscription.created") {
    // Handle subscription creation
    const createdSubscription = event.data.object;
    const metadata = createdSubscription.metadata as {
      pricingId: string;
      userId: string;
      maxQuantity: string;
    };
    if (metadata)
      await db.subscription.create({
        data: {
          status:
            createdSubscription.status == "active"
              ? "ACTIVE"
              : createdSubscription.status == "paused"
              ? "PAUSED"
              : createdSubscription.status == "incomplete"
              ? "INCOMPLETE"
              : "CANCELED",
          currentPeriodEnd: new Date(
            createdSubscription.current_period_end * 1000
          ),
          currentPeriodStart: new Date(
            createdSubscription.current_period_start * 1000
          ),
          gatewaySubscriptionId: createdSubscription.id,
          maxQuantity: Number(metadata.maxQuantity),
          gateway: "STRIPE",
          userId: metadata.userId,
          pricingId: metadata.pricingId,
        },
      });
  } else if (event.type === "customer.subscription.deleted") {
    const deletedSubscription = event.data.object;
    await db.subscription.update({
      where: {
        gatewaySubscriptionId_gateway: {
          gatewaySubscriptionId: deletedSubscription.id,
          gateway: "STRIPE",
        },
      },
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
