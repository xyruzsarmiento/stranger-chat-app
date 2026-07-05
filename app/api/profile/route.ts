import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", (session.user as { id?: string }).id)
    .single();

  if (error) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { bio, country, interests } = body;

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ bio, country, interests })
    .eq("user_id", (session.user as { id?: string }).id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  return NextResponse.json(data);
}
