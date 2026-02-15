// app/api/blocks/[id]/route.ts
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Block ID is required" }, { status: 400 });
    }

    const updateData: any = {
      updated_at: new Date().toISOString(), // 다시 추가
    };

    if (body.text_content !== undefined) {
      updateData.text_content = body.text_content;
    }

    if (body.image_url !== undefined) {
      updateData.image_url = body.image_url;
    }

    if (body.images !== undefined) {
      updateData.images = body.images;
    }

    // pf_article_blocks에도 updated_at이 없으므로 제거
    const { error } = await supabaseAdmin
      .from("pf_article_blocks")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Block 수정 실패:", error);
      return NextResponse.json(
        { error: `수정 실패: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Block 수정 에러:", error);
    return NextResponse.json(
      { error: error?.message ?? "수정 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Block ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("pf_article_blocks")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Block 삭제 실패:", error);
      return NextResponse.json(
        { error: `삭제 실패: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Block 삭제 에러:", error);
    return NextResponse.json(
      { error: error?.message ?? "삭제 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}