import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 업로드는 서버에서 "service_role"로 실행 → RLS 우회
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // 서버 전용
);

export const runtime = "nodejs"; // 파일 업로드는 Node 런타임이 안정적

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const bucket = form.get("bucket");
    const file = form.get("file") as File | null;
    let path = form.get("path") as string | null;

    if (!bucket || typeof bucket !== "string") {
      return NextResponse.json({ error: "bucket is required" }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    // 경로 기본값
    if (!path) {
      path = `uploads/${Date.now()}_${file.name}`;
    }

    // 업로드 (서비스 롤 → RLS 무시)
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, file, { upsert: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 공개 URL (버킷이 public일 때)
    const { data: pub } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path);

    return NextResponse.json({
      path: data.path,
      publicUrl: pub.publicUrl ?? null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 });
  }
}
