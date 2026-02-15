// app/api/articles/[id]/route.ts
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Article ID is required" }, { status: 400 });
    }

    // 1. Article 블록들 삭제
    const { error: blocksError } = await supabaseAdmin
      .from("pf_article_blocks")
      .delete()
      .eq("article_id", id);

    if (blocksError) {
      console.error("블록 삭제 실패:", blocksError);
    }

    // 2. Article 이미지들 삭제
    const { error: imagesError } = await supabaseAdmin
      .from("pf_article_images")
      .delete()
      .eq("article_id", id);

    if (imagesError) {
      console.error("이미지 레코드 삭제 실패:", imagesError);
    }

    // 3. Article 삭제
    const { error: articleError } = await supabaseAdmin
      .from("pf_articles")
      .delete()
      .eq("id", id);

    if (articleError) {
      console.error("Article 삭제 실패:", articleError);
      return NextResponse.json(
        { error: `삭제 실패: ${articleError.message}` },
        { status: 500 }
      );
    }

    // 4. 스토리지에서 이미지 파일들 삭제
    try {
      const { data: files } = await supabaseAdmin.storage
        .from("pf_article_images")
        .list(`articles/${id}`);

      if (files && files.length > 0) {
        const filePaths = files.map((f) => `articles/${id}/${f.name}`);
        await supabaseAdmin.storage.from("pf_article_images").remove(filePaths);
      }
    } catch (storageError) {
      console.error("스토리지 파일 삭제 실패:", storageError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Article 삭제 에러:", error);
    return NextResponse.json(
      { error: error?.message ?? "삭제 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Article ID is required" }, { status: 400 });
    }

    // updated_at 컬럼이 없으므로 제거
    const { error } = await supabaseAdmin
      .from("pf_articles")
      .update({
        title: body.title,
        category_id: body.category_id,
        updated_at: new Date().toISOString(), // 다시 추가
      })
      .eq("id", id);

    if (error) {
      console.error("Article 수정 실패:", error);
      return NextResponse.json(
        { error: `수정 실패: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Article 수정 에러:", error);
    return NextResponse.json(
      { error: error?.message ?? "수정 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}