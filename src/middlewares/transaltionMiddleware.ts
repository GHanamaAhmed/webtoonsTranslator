import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";

export async function translationMiddleware(
  req: NextRequest,
  next: () => Promise<NextResponse | undefined>
): Promise<NextResponse | undefined> {
  const session = await getServerSession(options);

  // Parse the request body
  const { ids }: { ids: string[] } = await req.json();

  const freeTimes = 15; // Free translations for all users
  let restTimes = 0;

  if (!session?.user) {
    return new NextResponse(null, { status: 401 }); // Unauthorized if no session
  }

  // Fetch user data including subscriptions and projects
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      subscriptions: {
        where: {
          status: "ACTIVE",
          // currentPeriodEnd: {
          //   gte: new Date(),
          // },
          usedQuantity: {
            lt: db.subscription.fields.maxQuantity,
          },
        },
        select: {
          maxQuantity: true,
          usedQuantity: true,
          id: true,
        },
      },
      transaction: {
        where: {
          status: "SUCCESS",
          usedQuantity: {
            lt: db.payment.fields.maxQuantity,
          },
        },
        select: {
          maxQuantity: true,
          usedQuantity: true,
          id: true,
        },
      },
    },
  });

  if (!user) {
    return new NextResponse(null, { status: 401 }); // Unauthorized if user not found
  }

  // Calculate maximum usage allowed based on subscriptions
  const maxUsage =
    user.subscriptions.reduce((acc, curr) => {
      return acc + (curr.maxQuantity - curr.usedQuantity);
    }, 0) +
    user.transaction.reduce((acc, curr) => {
      return acc + (curr.maxQuantity - curr.usedQuantity);
    }, 0) +
    freeTimes;
  restTimes = maxUsage;
  // If the user doesn't have enough remaining translations, return 403 Forbidden
  if (restTimes < 1) {
    return new NextResponse(null, { status: 403 });
  }

  req.subscriptionId = user.subscriptions?.[0]?.id;
  req.transactionId = user.transaction?.[0]?.id;
  // Proceed if enough translation slots are available
  return next();
}
