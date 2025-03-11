import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { NextResponse } from "next/server";

export async function GET() {
    const session = getServerSession(options)
    console.log("session from GET:", session);
    return new NextResponse(JSON.stringify(session));
}
