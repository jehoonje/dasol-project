// app/api/about/route.ts
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

// About 페이지 데이터 조회
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("pf_about")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("About 조회 실패:", error);
      return NextResponse.json(
        { error: `조회 실패: ${error.message}` },
        { status: 500 }
      );
    }

    // 데이터가 없으면 빈 객체 반환
    if (!data) {
      return NextResponse.json({
        id: null,
        content: '',
        image_url: null
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("About 조회 에러:", error);
    return NextResponse.json(
      { error: error?.message ?? "조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// About 페이지 데이터 업데이트 또는 생성
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, content, image_url } = body;

    //console.log('=== About Update/Create ===');
    //console.log('ID:', id);
    //console.log('Content length:', content?.length);
    //console.log('Image URL:', image_url?.substring(0, 50));

    // 기존 레코드가 있으면 업데이트, 없으면 생성
    if (id) {
      const { data, error } = await supabaseAdmin
        .from("pf_about")
        .update({
          content,
          image_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("About 업데이트 실패:", error);
        return NextResponse.json(
          { error: `업데이트 실패: ${error.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data });
    } else {
      // 새로 생성
      const { data, error } = await supabaseAdmin
        .from("pf_about")
        .insert({
          content,
          image_url,
        })
        .select()
        .single();

      if (error) {
        console.error("About 생성 실패:", error);
        return NextResponse.json(
          { error: `생성 실패: ${error.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data });
    }
  } catch (error: any) {
    console.error("About 저장 에러:", error);
    return NextResponse.json(
      { error: error?.message ?? "저장 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}