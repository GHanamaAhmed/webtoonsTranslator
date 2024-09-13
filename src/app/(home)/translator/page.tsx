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
            active: true,
            endDate: {
              gt: new Date(),
            },
          },
          select: {
            maxUsage: true,
            plan: {
              select: {
                type: true,
              },
            },
            endDate: true,
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

    if (user) {
      const maxUsage =
        user.subscriptions.reduce((acc, curr) => {
          if (curr.plan.type === "one-time") {
            return acc + (curr.maxUsage || 0);
          } else if (
            curr.plan.type === "recurring" &&
            curr.endDate &&
            curr.endDate > new Date()
          ) {
            return acc + (curr.maxUsage || 0);
          }
          return acc;
        }, 0) + freeTimes;

      const usages = user.projects.reduce(
        (acc, project) =>
          acc +
          project.chapters.reduce(
            (acc, chapter) => acc + chapter.pages.length,
            0
          ),
        0
      );

      restTimes = maxUsage - usages;
    }
  }
  const s = await db.subscription.findMany();
  console.log(s);

  return <Demo supportedLanguages={supportedLanguages} times={restTimes} />;
}
