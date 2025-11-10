import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const runtime = "nodejs";

// GET: 최신 배경 이미지 URL 가져오기
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("pf_backgrounds")
      .select("url")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ url: null });
      }
      console.error("Supabase GET error:", error);
      return NextResponse.json({ url: null }, { status: 500 });
    }

    return NextResponse.json({ url: data?.url || null });
  } catch (error: any) {
    console.error("Background GET error:", error);
    return NextResponse.json({ url: null }, { status: 500 });
  }
}

// POST: 새 배경 이미지 URL 저장
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("pf_backgrounds")
      .insert({ url, created_at: new Date().toISOString() })
      .select()
      .single();

    if (error) {
      console.error("Supabase POST error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: data.url });
  } catch (error: any) {
    console.error("Background POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}