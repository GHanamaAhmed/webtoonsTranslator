import { db } from "@/lib/db";
import { withMiddleware } from "@/lib/utils";
import { authMiddlware } from "@/middlewares/authMiddlware";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with the secret key from your environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

async function handleStripePayment(req: NextRequest) {
  try {
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

    // Define payment mode (one-time or subscription)
    const paymentMode = plan.type == "one-time" ? "payment" : "subscription"; // Assume `plan.isOneTime` exists in the database

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: plan.name, // Use the actual plan name
            },
            unit_amount: unitAmountCents, // The price in cents
            recurring:
              plan.type == "recurring"
                ? {
                    interval: plan.duration as
                      | "month"
                      | "day"
                      | "year"
                      | "week",
                  } // Recurring for subscriptions
                : undefined, // No recurring for one-time payments
          },
          quantity: 1,
        },
      ],
      mode: paymentMode, // Use "payment" for one-time, "subscription" for recurring
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/translator?session_id={CHECKOUT_SESSION_ID}`,
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
