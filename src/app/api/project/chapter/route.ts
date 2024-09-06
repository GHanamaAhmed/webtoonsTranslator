import { db } from "@/lib/db";
import { withMiddleware } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { options } from "../../auth/[...nextauth]/options";
import { v4 as uuid } from "uuid";
export const GET = (req: NextRequest) =>
  withMiddleware(req, [], async (req: NextRequest) => {
    try {
      const url = new URL(req.url);
      const projectId = url.searchParams.get("projectId");
      if (!projectId)
        return new NextResponse(null, {
          status: 404,
        });
      const chapter = await db.chapter.create({
        data: {
          project: {
            connect: {
              id: projectId,
            },
          },
          name: "default",
        },
      });
      return new NextResponse(JSON.stringify({ chapterId: chapter.id }), {
        status: 200,
      });
    } catch (error) {
      console.error(error);
      return new NextResponse(null, {
        status: 500,
      });
    }
  });
