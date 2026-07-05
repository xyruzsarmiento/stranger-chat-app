import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const { reason, reportedSocketId } = body;

  if (!reason || !reportedSocketId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const validReasons = ["spam", "harassment", "nsfw", "fake"];
  if (!validReasons.includes(reason)) {
    return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
  }

  try {
    if (session?.user) {
      const supabase = createServerSupabaseClient();
      await supabase.from("reports").insert({
        reporter_id: (session.user as { id?: string }).id ?? "anonymous",
        reported_id: reportedSocketId,
        reason,
      });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}
