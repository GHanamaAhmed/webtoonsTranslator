import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import { v4 as uuid } from "uuid";
import { pusherServer } from "@/lib/pusher";
const WEEKLY_TRANSLATION_LIMIT = 30; // Limit for all users per week
export async function POST(req: NextRequest) {
  const session = await getServerSession(options);
  const user = session?.user;
  const body = await req.json();
  const socketId = body.socketId;

  if (user) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
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
      return new Response(null, {
        status: 403,
      });
    }
    // Check subscription status
    const subscription = user.subscriptions.find((sub) => sub.active);
    if (subscription) {
      const authResponse = pusherServer.authenticateUser(socketId, {
        id: user.id,
        user_info: {
          name: user.name,
        },
      });
      return NextResponse.json(authResponse);
    } else {
      const res = NextResponse.next();
      const translationsUsed = parseInt(
        req.cookies.get("guestTranslationsUsed")?.value || "0",
        10
      );
      const user2 = {
        id: user.id,
        user_info: {
          name: "Guest",
        },
      };
      if (translationsUsed < WEEKLY_TRANSLATION_LIMIT) {
        const authResponse = pusherServer.authenticateUser(socketId, user2);
        return NextResponse.json(authResponse);
      } else {
        return new Response(null, {
          status: 403,
        });
      }
    }
  } else {
    const res = NextResponse.next();
    let guestUserId = req.cookies.get("guestUserId")?.value;
    const translationsUsed = parseInt(
      req.cookies.get("guestTranslationsUsed")?.value || "0",
      10
    );
    if (!guestUserId) {
      guestUserId = uuid();
      res.cookies.set("guestUserId", guestUserId, {
        path: "/",
        httpOnly: true,
      });
    }
    const guestUser = {
      id: guestUserId,
      user_info: {
        name: "Guest",
      },
    };
    if (translationsUsed < WEEKLY_TRANSLATION_LIMIT) {
      const authResponse = pusherServer.authenticateUser(socketId, guestUser);
      return NextResponse.json(authResponse);
    } else {
      return new Response(null, {
        status: 403,
      });
    }
  }
}
