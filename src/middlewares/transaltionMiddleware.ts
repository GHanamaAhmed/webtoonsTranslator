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

  let restTimes = 0;
  const freeTimes = 30;
  if (!session?.user) {
    return new NextResponse(null, {
      status: 401,
    });
  }
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
  if (!user) {
    return new NextResponse(null, {
      status: 401,
    });
  }
  const maxUsage =
    (user?.subscriptions.reduce((acc, curr) => acc + (curr.maxUsage || 0), 0) ||
      0) + freeTimes;
  const usages =
    user?.projects.reduce(
      (acc, curr) =>
        acc + curr.chapters.reduce((acc, curr) => acc + curr.pages.length, 0),
      0
    ) || 0;
  restTimes = maxUsage - usages || 0;
  if (restTimes < ids.length) {
    return new NextResponse(null, {
      status: 403,
    });
  }
  return next();
}
