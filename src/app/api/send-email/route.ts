import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, message } = await request.json();

    if (!email || !message) {
      return NextResponse.json({ error: "이메일과 메시지를 모두 입력해주세요." }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: "Portfolio System <onboarding@resend.dev>",
      to: [process.env.CONTACT_RECEIVE_EMAIL as string],
      replyTo: email, // 💡 reply_to 가 아닌 replyTo 로 수정!
      subject: `[웹사이트 문의] ${email} 님으로부터 온 메시지`,
      text: `보낸 사람 이메일: ${email}\n\n문의 내용:\n${message}`,
    });

    if (error) {
      console.error("Resend 발송 에러:", error);
      return NextResponse.json({ error: "이메일 전송에 실패했습니다." }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("서버 에러:", error);
    return NextResponse.json(
      { error: "이메일 전송 중 서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}