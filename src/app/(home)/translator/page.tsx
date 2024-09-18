import React from "react";
import Demo from "./_components/demo";
import { listGoogleSupportedLanguages } from "@/lib/aiTools/google/translate";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";

const freeTimes = 15;

export default async function Page() {
  const supportedLanguages = await listGoogleSupportedLanguages();
  const session = await getServerSession(options);
  let restTimes = 0;

  if (session) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        subscriptions: {
          where: {
            status: "ACTIVE",
            currentPeriodEnd: {
              gte: new Date(),
            },
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
              lt: db.transaction.fields.maxQuantity,
            },
          },
          select: {
            maxQuantity: true,
            usedQuantity: true,
          },
        },
      },
    });

    if (user) {
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
    }
  }

  return <Demo supportedLanguages={supportedLanguages} times={restTimes} />;
}
