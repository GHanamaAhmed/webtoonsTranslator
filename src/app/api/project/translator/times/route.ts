import { options } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(options);
  const freeTimes = 15;
  if (!session?.user)
    return new NextResponse(null, {
      status: 401,
    });
  let restTimes = 0;
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
        },
      },
    },
  });
  if (!user)
    return new NextResponse(null, {
      status: 401,
    });

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
  console.log("fsdsfd");
  
  return new NextResponse(JSON.stringify({ restTimes }), {
    status: 200,
  });
}
