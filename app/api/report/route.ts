import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { reason, reportedSocketId } = body;

  if (!reason || !reportedSocketId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const validReasons = ["spam", "harassment", "nsfw", "fake"];
  if (!validReasons.includes(reason)) {
    return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
  }

  console.log(`[Report] ${reportedSocketId} reported for: ${reason}`);
  return NextResponse.json({ success: true });
}
