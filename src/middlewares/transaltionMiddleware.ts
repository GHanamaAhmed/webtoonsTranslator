import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";

export async function translationMiddleware(
  req: NextRequest,
  next: () => Promise<NextResponse | undefined>
): Promise<NextResponse | undefined> {
  const session = await getServerSession(options);

  const { ids }: { ids: string[] } = await req.json();

  const freeTimes = 50; // Free translations offered to users
  let restTimes = 0;

  if (!session?.user) {
    return new NextResponse(null, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      subscriptions: {
        where: {
          active: true,
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

  if (!user) {
    return new NextResponse(null, { status: 401 });
  }

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
      project.chapters.reduce((acc, chapter) => acc + chapter.pages.length, 0),
    0
  );

  restTimes = maxUsage - usages;

  if (restTimes < ids.length) {
    return new NextResponse(null, { status: 403 }); // Forbidden if not enough translations left
  }

  return next();
}
