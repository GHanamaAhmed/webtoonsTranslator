import { db } from "@/lib/db";
import { withMiddleware } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { options } from "../auth/[...nextauth]/options";
export const GET = (req: NextRequest) =>
  withMiddleware(req, [], async (req: NextRequest) => {
    try {
      const session = await getServerSession(options);
      let project = await db.project.findFirst({
        where: {
          name: "default",
          userId: session?.user.id,
        },
      });
      if (!project) {
        project = await db.project.create({
          data: {
            name: "default",
            user: {
              connect: {
                id: session?.user.id,
              },
            },
          },
        });
      }
      return new NextResponse(JSON.stringify({ projectId: project.id }), {
        status: 200,
      });
    } catch (error) {
      console.error(error);
      return new NextResponse(null, {
        status: 500,
      });
    }
  });
