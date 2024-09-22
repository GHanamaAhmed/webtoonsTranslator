import { options } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import { stripe } from "@/lib/payments/stripe";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// write code cancel stripe subscription
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return new NextResponse(null, { status: 401 });
    }
    const customers = await stripe.customers.list({
      email: session.user.email?.toString(),
      limit: 1,
    });

    if (customers.data.length === 0) {
      return new NextResponse(null, { status: 400 });
    }
    const costomer = customers.data[0];
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: costomer.id,
      return_url: process.env.NEXT_PUBLIC_BASE_URL,
    });
    return new NextResponse(JSON.stringify({ url: portalSession.url }), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (e) {
    return new NextResponse(null, {
      status: 500,
    });
  }
}
