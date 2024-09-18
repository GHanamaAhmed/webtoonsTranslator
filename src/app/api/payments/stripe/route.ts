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
    const { pricingId } = await req.json();
    // Validate planId and pricingId
    if (!pricingId) {
      return new NextResponse(null, { status: 400 });
    }

    // Find the plan with the specific pricing tier
    const price = await db.pricing.findUnique({
      where: {
        id: pricingId,
      },
    });

    if (!price) {
      return new NextResponse(null, { status: 400 });
    }
    // Calculate the price in cents
    const unitAmount = Number(
      (price.pricePerUnit * price.maxQuantity).toFixed(2)
    );
    const unitAmountCents = unitAmount * 100; // Multiply by 100 to get the price in cents
    // Define payment mode (one-time or subscription)
    const paymentMode = !price.planId ? "payment" : "subscription"; // Assume `plan.isOneTime` exists in the database
    // Create a Stripe checkout session
    let session;
    let customer;
    const customers = await stripe.customers.list({
      email: userSession.user.email?.toString(),
    });
    if (customers.data.length > 0) {
      customer = customers.data[0];
    }
    if (paymentMode === "subscription") {
      const plan = await db.plan.findUnique({
        where: {
          id: price.planId?.toString(),
        },
      });
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card", "paypal"],
        customer: customer?.id || undefined,
        customer_email: customer?.id
          ? undefined
          : userSession.user.email?.toString(),
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: unitAmountCents, // The price in cents
              product_data: {
                name: price.name,
                description: price.description,
              },
              recurring: {
                interval:
                  plan?.interval == "THREE_MONTHLY"
                    ? "month"
                    : plan?.interval == "MONTHLY"
                    ? "month"
                    : plan?.interval == "WEEKLY"
                    ? "week"
                    : plan?.interval == "YEARLY"
                    ? "year"
                    : "day",
                interval_count: plan?.interval == "THREE_MONTHLY" ? 3 : 1,
              },
            },
            quantity: 1,
          },
        ],
        mode: paymentMode, // Use "payment" for one-time, "subscription" for recurring
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/translator`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
      });
      await db.transaction.create({
        data: {
          amount: session.amount_total as number,
          currency: session.currency as string,
          gateway: "STRIPE",
          status: "PENDING",
          maxQuantity: unitAmount,
          type: "SUBSCRIPTION",
          userId: userSession.user.id,
          gatewayTransactionId: session.payment_intent as string,
          pricingId: price.id,
          subscriptionId: session.subscription?.toString(),
        },
      });
      await db.subscription.create({
        data: {
          userId: userSession.user.id,
          gatewaySubscriptionId: session.subscription as string,
          gateway: "STRIPE",
          status: "PENDING",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
          priceId: price.id,
          maxQuantity: unitAmount,
        },
      });
    } else if (paymentMode === "payment") {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card", "paypal"],

        customer: customer?.id || undefined,
        customer_email: customer?.id
          ? undefined
          : userSession.user.email?.toString(),
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: unitAmountCents, // The price in cents
              product_data: {
                name: price.name,
                description: price.description,
              },
            },
            quantity: 1,
          },
        ],
        mode: paymentMode, // Use "payment" for one-time, "subscription" for recurring
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/translator`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
      });
      await db.transaction.create({
        data: {
          amount: session.amount_total as number,
          currency: session.currency as string,
          gateway: "STRIPE",
          status: "PENDING",
          maxQuantity: unitAmount,
          type: "ONE_TIME",
          userId: userSession.user.id,
          gatewayTransactionId: session.payment_intent as string,
          pricingId: price.id,
        },
      });
    }
    // Return the session ID for frontend to redirect
    return new NextResponse(JSON.stringify({ sessionId: session?.id }), {
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
