import { db } from "@/lib/db";
import { stripe } from "@/lib/payments/stripe";
import { withMiddleware } from "@/lib/utils";
import { authMiddlware } from "@/middlewares/authMiddlware";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { options } from "../../auth/[...nextauth]/options";
import { Prisma } from "@prisma/client";
async function findOrCreateProductAndPrice(
  pricing: Prisma.PricingGetPayload<{ include: { plan: true } }> | null,
  isSubscription: boolean,
  unitAmountCents: number,
  quantity: number,
  currency: string = "usd"
) {
  try {
    // Step 1: Search for existing product in Stripe
    const product = await stripe.products
      .list({
        limit: 100,
        active: true,
      })
      .then((products) =>
        products.data.find(
          (prod) =>
            prod.name ===
              (isSubscription
                ? `Subscription ${pricing?.name} (Quantity: ${quantity})`
                : `Payment ${pricing?.name} (Quantity: ${quantity})`) &&
            prod.active
        )
      );

    let stripeProduct;
    if (product) {
      stripeProduct = product;
    } else {
      // Step 2: If no product found, create a new one
      stripeProduct = await stripe.products.create({
        name: isSubscription
          ? `Subscription ${pricing?.name} (Quantity: ${quantity})`
          : `Payment ${pricing?.name} (Quantity: ${quantity})`, // Include quantity in the product name
        description: pricing?.description || "", // Optionally include a description
        active: true,
      });
      console.log("Created new product in Stripe:", stripeProduct);
    }

    // Step 3: Search for existing price for the product
    const price = await stripe.prices
      .list({
        limit: 100,
        product: stripeProduct?.id, // Associating price with the product
        currency: currency,
        type: pricing?.plan ? "recurring" : "one_time",
        recurring: pricing?.plan
          ? {
              interval:
                pricing?.plan.interval === "QUARTERLY"
                  ? "month"
                  : pricing?.plan.interval === "MONTHLY"
                  ? "month"
                  : pricing?.plan.interval === "WEEKLY"
                  ? "week"
                  : pricing?.plan.interval === "YEARLY"
                  ? "year"
                  : "day",
            }
          : undefined,
      })
      .then((prices) =>
        prices.data.find(
          (price) =>
            price.unit_amount === unitAmountCents &&
            price.transform_quantity?.divide_by === quantity &&
            (pricing?.plan?.interval === "QUARTERLY"
              ? 3 === price.recurring?.interval_count
              : 1 === price.recurring?.interval_count)
        )
      );

    let stripePrice;
    if (price) {
      stripePrice = price;
      console.log("Found existing price in Stripe:", stripePrice);
    } else {
      // Step 4: If no price found, create a new price
      stripePrice = await stripe.prices.create({
        product: stripeProduct?.id, // Associating price with the product
        unit_amount: unitAmountCents,
        currency: currency,
        recurring: pricing?.plan
          ? {
              interval:
                pricing?.plan.interval === "QUARTERLY"
                  ? "month"
                  : pricing?.plan.interval === "MONTHLY"
                  ? "month"
                  : pricing?.plan.interval === "WEEKLY"
                  ? "week"
                  : pricing?.plan.interval === "YEARLY"
                  ? "year"
                  : "day",
              interval_count: pricing?.plan.interval === "QUARTERLY" ? 3 : 1,
            }
          : undefined,
      });
      console.log("Created new price in Stripe:", stripePrice);
    }
    return { stripeProduct, stripePrice };
  } catch (error) {
    console.error("Error finding or creating product/price in Stripe:", error);
    throw error;
  }
}

async function handleStripePayment(req: NextRequest) {
  try {
    const userSession = await getServerSession(options);
    if (!userSession) {
      return new NextResponse(null, { status: 401 });
    }

    const { pricingId } = await req.json();
    if (!pricingId) {
      return new NextResponse(null, { status: 400 });
    }

    const price = await db.pricing.findUnique({
      where: { id: pricingId, active: true },
      include: {
        plan: true,
      },
    });

    if (!price) {
      return new NextResponse(null, { status: 400 });
    }

    const unitAmountCents = price.price * 100;
    const paymentMode = !price.plan ? "payment" : "subscription";
    console.log("Payment mode:", paymentMode);

    // Find or create Stripe customer
    let customer;
    const customers = await stripe.customers.list({
      email: userSession.user.email?.toString(),
    });
    if (customers.data.length > 0) {
      customer = customers.data[0];
    }

    let session;
    if (paymentMode === "subscription") {
      const { stripePrice } = await findOrCreateProductAndPrice(
        price,
        true,
        unitAmountCents,
        price.maxQuantity
      );
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card", "paypal"],
        subscription_data: {
          metadata: {
            pricingId: price.id,
            userId: userSession.user.id,
            maxQuantity: price.maxQuantity,
          },
        },
        customer: customer?.id || undefined,
        customer_email: customer?.id
          ? undefined
          : userSession.user.email?.toString(),

        line_items: [{ price: stripePrice.id, quantity: 1 }],
        mode: paymentMode,
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/translator`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
      });
    } else {
      const { stripePrice } = await findOrCreateProductAndPrice(
        null,
        false,
        unitAmountCents,
        price.maxQuantity
      );
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card", "paypal"],
        customer: customer?.id || undefined,
        customer_email: customer?.id
          ? undefined
          : userSession.user.email?.toString(),

        payment_intent_data: {
          metadata: {
            pricingId: price.id,
            userId: userSession.user.id,
            maxQuantity: price.maxQuantity,
            mode: paymentMode,
          },
        },
        line_items: [
          {
            price: stripePrice.id,
            quantity: 1,
          },
        ],
        mode: paymentMode,
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/translator`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
      });
    }
    // Return the session ID for frontend to redirect
    return new NextResponse(JSON.stringify({ sessionId: session?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error);
    return new NextResponse(null, { status: 500 });
  }
}

export const POST = async (req: NextRequest) =>
  await withMiddleware(req, [], handleStripePayment);
