import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { email, message } = await request.json();

    if (!email || !message) {
      return NextResponse.json({ error: "이메일과 메시지를 모두 입력해주세요." }, { status: 400 });
    }

    // SMTP 서버 설정 (발송용 시스템 계정 정보)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    // 메일 옵션 설정
    const mailOptions = {
      from: `"포트폴리오 문의 알림" <${process.env.EMAIL_USER}>`, // 발신자 표시
      to: process.env.CONTACT_RECEIVE_EMAIL, // 메일을 받을 의뢰인(클라이언트) 주소
      replyTo: email, // 의뢰인이 '답장'을 누르면 문의를 남긴 방문자(email)에게 바로 답장됨
      subject: `[웹사이트 문의] ${email} 님으로부터 새로운 메시지가 도착했습니다.`,
      text: `보낸 사람: ${email}\n\n[문의 내용]\n${message}`,
    };

    // 메일 발송 실행
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("이메일 전송 실패:", error);
    return NextResponse.json(
      { error: "이메일 전송 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}