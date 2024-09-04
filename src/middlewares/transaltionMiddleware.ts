import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
export async function translationMiddleware(
  req: NextRequest
): Promise<NextResponse | undefined> {
  const session = await getServerSession(options);
  if (!session?.user) {
    return new NextResponse(null, {
      status: 401,
    });
  }
  const user = await db.user.findUnique({
    where: { id: session?.user.id },
    select: {
      id: true,
      name: true,
      subscriptions: {
        select: {
          active: true,
        },
      },
      projects: {
        select: {
          chapters: {
            select: {
              pages: {
                select: {
                  id: true,
                },
              },
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
  // Check subscription status
  const subscription = user.subscriptions.find((sub) => sub.active);
  if (!subscription) {
    return new NextResponse(null, {
      status: 403,
    });
  }
}
