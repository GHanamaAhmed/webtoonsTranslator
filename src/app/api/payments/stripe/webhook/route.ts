import { db } from "@/lib/db";
import { stripe } from "@/lib/payments/stripe";
import { calculateEndDate } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
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
      console.error(err);
      return new NextResponse(`Webhook Error: ${err}`, {
        status: 400,
      });
    }
    if (event.type === "checkout.session.completed") {
      console.log("subscription success");
      const metadata = event.data.object.metadata as {
        planId: string;
        priceId: string;
        userId: string;
        maxUsage: string;
        type: "one-time" | "recurring";
        period_end: string;
      };
      await db.subscription.create({
        data: {
          maxUsage: Number(metadata.maxUsage),
          endDate:
            event.data.object.mode == "subscription"
              ? calculateEndDate(metadata.period_end)
              : null,
          planId: metadata.planId,
          userId: metadata.userId,
        },
      });
    }
    return new NextResponse(JSON.stringify({ received: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error In Stripe Webhook:", error);
    return new NextResponse(null, {
      status: 500,
    });
  }
}
