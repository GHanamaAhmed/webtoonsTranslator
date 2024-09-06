import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function authMiddlware(
  req: NextRequest,
  next: () => Promise<NextResponse | undefined>
): Promise<NextResponse | undefined> {
  const session = await getServerSession(options);
  if (!session?.user) {
    return new NextResponse(null, { status: 401 });
  }
  return next();
}
