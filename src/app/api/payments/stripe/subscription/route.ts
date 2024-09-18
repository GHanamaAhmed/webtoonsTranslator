import { options } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import { stripe } from "@/lib/payments/stripe";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

// write code cancel stripe subscription
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(options);
  if (!session?.user) {
    return new Response(null, { status: 401 });
  }
  const { stripeSubId } = await req.json();
  if (stripeSubId) {
    await stripe.subscriptions.update(stripeSubId, {
      cancel_at_period_end: true,
    });
    await db.subscription.update({
      where: {
        stripeSubId: stripeSubId,
      },
      data: {
        autoRenew: false,
      },
    });
    return new Response(null, { status: 200 });
  }
  return new Response(null, { status: 400 });
}

// Resubscribe (reactivate) the canceled Stripe subscription
export async function PUT(req: NextRequest) {
  const session = await getServerSession(options);
  if (!session?.user) {
    return new Response(null, { status: 401 });
  }

  const { stripeSubId } = await req.json();
  if (!stripeSubId) {
    return new Response(null, { status: 400 });
  }

  try {
    // Fetch the subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(stripeSubId);

    if (subscription.cancel_at_period_end) {
      // If the subscription is set to cancel at the end of the period, reactivate it
      await stripe.subscriptions.update(stripeSubId, {
        cancel_at_period_end: false, // Resubscribe to the plan
      });

      // Update the database record to reflect the reactivation
      await db.subscription.update({
        where: {
          stripeSubId: stripeSubId,
        },
        data: {
          autoRenew: true, // Reactivate the auto-renewal
        },
      });

      return new Response(null, {
        status: 200,
      });
    } else {
      return new Response(
        JSON.stringify({ message: "Subscription is already active." }),
        {
          status: 400,
        }
      );
    }
  } catch (error) {
    console.error("Error reactivating subscription:", error);
    return new Response(
      JSON.stringify({ error: "Failed to reactivate subscription." }),
      {
        status: 500,
      }
    );
  }
}
