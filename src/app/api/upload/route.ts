import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    //console.log("[Upload API] Request received");
    
    const form = await req.formData();

    const bucket = form.get("bucket");
    const file = form.get("file") as File | null;
    let path = form.get("path") as string | null;

    //console.log("[Upload API] Bucket:", bucket);
    //console.log("[Upload API] File:", file?.name, file?.size);
    //console.log("[Upload API] Path:", path);

    if (!bucket || typeof bucket !== "string") {
      console.error("[Upload API] Bucket missing or invalid");
      return NextResponse.json({ error: "bucket is required" }, { status: 400 });
    }
    if (!file) {
      console.error("[Upload API] File missing");
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    // 경로 기본값
    if (!path) {
      path = `uploads/${Date.now()}_${file.name}`;
    }

    //console.log("[Upload API] Uploading to Supabase...");

    // 업로드 (서비스 롤 → RLS 무시)
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, file, { upsert: false });

    if (error) {
      console.error("[Upload API] Supabase upload error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    //console.log("[Upload API] Upload successful:", data.path);

    // 공개 URL (버킷이 public일 때)
    const { data: pub } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path);

    //console.log("[Upload API] Public URL:", pub.publicUrl);

    return NextResponse.json({
      path: data.path,
      publicUrl: pub.publicUrl ?? null,
    });
  } catch (e: any) {
    console.error("[Upload API] Unexpected error:", e);
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 });
  }
}