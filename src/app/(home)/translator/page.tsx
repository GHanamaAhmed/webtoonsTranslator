import React from "react";

import Demo from "./_components/demo";
import { listSupportedLanguages } from "@/lib/aiTools/translate";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
const freeTimes = 30;
export default async function Page() {
  const supportedLanguages = await listSupportedLanguages();
  
  const session = await getServerSession(options);
  let restTimes = 0;
  if (session) {
    const user = await db.user.findUnique({
      where: { id: session?.user.id },
      select: {
        subscriptions: {
          where: {
            active: true,
            endDate: {
              gt: new Date(),
            },
          },
          select: {
            maxUsage: true,
          },
        },
        projects: {
          where: {
            chapters: {
              some: {
                pages: {
                  some: {
                    textBlocks: {
                      some: {
                        translatedBlock: {},
                      },
                    },
                  },
                },
              },
            },
          },
          select: {
            chapters: {
              select: {
                pages: true,
              },
            },
          },
        },
      },
    });
    const maxUsage =
      (user?.subscriptions.reduce(
        (acc, curr) => acc + (curr.maxUsage || 0),
        0
      ) || 0) + freeTimes;
    const usages =
      user?.projects.reduce(
        (acc, curr) =>
          acc + curr.chapters.reduce((acc, curr) => acc + curr.pages.length, 0),
        0
      ) || 0;
    restTimes = maxUsage - usages || 0;
  }
  return <Demo supportedLanguages={supportedLanguages} times={restTimes} />;
}
