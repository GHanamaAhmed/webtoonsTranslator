import { db } from "@/lib/db";
import { stripe } from "@/lib/payments/stripe";
import { withMiddleware } from "@/lib/utils";
import { authMiddlware } from "@/middlewares/authMiddlware";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { options } from "../../auth/[...nextauth]/options";
async function handleStripePayment(req: NextRequest) {
  try {
    const userSession = await getServerSession(options);
    if (!userSession) {
      return new NextResponse(null, { status: 401 });
    }
    const { planId, pricingId } = await req.json();

    // Validate planId and pricingId
    if (!planId || !pricingId) {
      return new NextResponse(null, { status: 400 });
    }

    // Find the plan with the specific pricing tier
    const plan = await db.plan.findUnique({
      where: {
        id: planId,
      },
      include: {
        pricing: true, // Include all pricing options for this plan
      },
    });

    if (!plan) {
      return new NextResponse(null, { status: 400 });
    }

    // Find the specific pricing tier from the plan's pricing options
    const selectedPricing = plan.pricing.find(
      (pricing) => pricing.id === pricingId
    );

    if (!selectedPricing) {
      return new NextResponse(null, { status: 400 });
    }

    // Calculate the price in cents
    const unitAmount = Number(
      (selectedPricing.pricePerUnit * selectedPricing.maxUsage).toFixed(2)
    );
    const unitAmountCents = unitAmount * 100; // Multiply by 100 to get the price in cents
    console.log(unitAmountCents);

    // Define payment mode (one-time or subscription)
    const paymentMode = plan.type == "one-time" ? "payment" : "subscription"; // Assume `plan.isOneTime` exists in the database
    const recurring =
      plan.type == "recurring"
        ? {
            interval:
              plan.duration == "three-month"
                ? "month"
                : (plan.duration as "month" | "day" | "year" | "week"),
            interval_count: plan.duration == "three-month" ? 3 : 1,
          } // Recurring for subscriptions
        : undefined; // No recurring for one-time payments

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "paypal"],
      metadata: {
        planId: plan.id,
        priceId: selectedPricing.id,
        userId: userSession.user.id,
        maxUsage: selectedPricing.maxUsage.toString(),
        type: plan.type,
        period_end: plan.duration,
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: unitAmountCents, // The price in cents
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            recurring,
          },
          quantity: 1,
        },
      ],
      mode: paymentMode, // Use "payment" for one-time, "subscription" for recurring
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/translator`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
    });
    // Return the session ID for frontend to redirect
    return new NextResponse(JSON.stringify({ sessionId: session.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error);
    return new NextResponse(null, {
      status: 500,
    });
  }
}

export const POST = async (req: NextRequest) =>
  await withMiddleware(req, [authMiddlware], handleStripePayment);
