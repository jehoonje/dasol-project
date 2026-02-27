// app/api/contact/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Contact 페이지 데이터 조회
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("pf_contact")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // 데이터가 없는 경우 제외
      console.error("Contact 조회 실패:", error);
      return NextResponse.json(
        { error: `조회 실패: ${error.message}` },
        { status: 500 }
      );
    }

    // 데이터가 없으면 기본값 반환
    if (!data) {
      return NextResponse.json({
        id: null,
        email: 'hello@example.com',
        instagram_url: 'https://instagram.com/'
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Contact 조회 에러:", error);
    return NextResponse.json(
      { error: error?.message ?? "조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// Contact 페이지 데이터 업데이트 또는 생성
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, email, instagram_url } = body;

    if (id) {
      // 기존 레코드 업데이트
      const { data, error } = await supabaseAdmin
        .from("pf_contact")
        .update({
          email,
          instagram_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Contact 업데이트 실패:", error);
        return NextResponse.json({ error: `업데이트 실패: ${error.message}` }, { status: 500 });
      }
      return NextResponse.json({ success: true, data });
    } else {
      // 새 레코드 생성
      const { data, error } = await supabaseAdmin
        .from("pf_contact")
        .insert({ email, instagram_url })
        .select()
        .single();

      if (error) {
        console.error("Contact 생성 실패:", error);
        return NextResponse.json({ error: `생성 실패: ${error.message}` }, { status: 500 });
      }
      return NextResponse.json({ success: true, data });
    }
  } catch (error: any) {
    console.error("Contact 저장 에러:", error);
    return NextResponse.json(
      { error: error?.message ?? "저장 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}