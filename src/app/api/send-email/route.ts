import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Resend API 키 (실제 운영 시 환경변수로 관리)
// 테스트용으로 임시 처리
const resend = new Resend(process.env.RESEND_API_KEY || 're_test_key');

interface Fortune {
  id: number;
  category: string;
  categoryLabel: string;
  title: string;
  message: string;
  emoji: string;
}

const getCategoryGradient = (category: string): string => {
  const gradients: Record<string, string> = {
    idiom: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
    bible: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    talmud: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
    korean: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
    modern: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
  };
  return gradients[category] || gradients.korean;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, fortune } = body as { email: string; fortune: Fortune };

    if (!email || !fortune) {
      return NextResponse.json(
        { success: false, error: 'Email and fortune are required' },
        { status: 400 }
      );
    }

    // 이메일 HTML 템플릿
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>2026 럭키 픽 - 당신의 덕담</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; background: linear-gradient(135deg, #fef7f0 0%, #fce4ec 50%, #e3f2fd 100%);">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 500px; width: 100%; border-collapse: collapse;">
              <!-- Header -->
              <tr>
                <td align="center" style="padding-bottom: 30px;">
                  <div style="font-size: 60px;">🐴</div>
                  <h1 style="margin: 16px 0 8px; font-size: 32px; background: linear-gradient(135deg, #ff6b9d 0%, #c44dff 50%, #6c5ce7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                    2026 럭키 픽
                  </h1>
                  <p style="margin: 0; color: #666; font-size: 16px;">병오년(말띠 해) 특별 덕담</p>
                </td>
              </tr>

              <!-- Fortune Card -->
              <tr>
                <td>
                  <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(145deg, #ffffff 0%, #ffeef8 100%); border-radius: 24px; box-shadow: 0 10px 40px rgba(255, 107, 157, 0.2);">
                    <tr>
                      <td style="padding: 32px; text-align: center;">
                        <!-- Category Badge -->
                        <div style="display: inline-block; padding: 8px 20px; border-radius: 50px; background: ${getCategoryGradient(fortune.category)}; color: white; font-size: 14px; font-weight: bold; margin-bottom: 20px;">
                          ${fortune.categoryLabel}
                        </div>

                        <!-- Emoji -->
                        <div style="font-size: 64px; margin-bottom: 20px;">${fortune.emoji}</div>

                        <!-- Title -->
                        <h2 style="margin: 0 0 16px; font-size: 24px; color: #1a1a2e;">
                          ${fortune.title}
                        </h2>

                        <!-- Message -->
                        <p style="margin: 0; font-size: 18px; color: #555; line-height: 1.6;">
                          ${fortune.message}
                        </p>

                        <!-- Fortune Number -->
                        <div style="margin-top: 24px; color: #ffb6c1; font-size: 14px; font-weight: bold;">
                          #${fortune.id}
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td align="center" style="padding-top: 30px;">
                  <p style="margin: 0 0 8px; color: #888; font-size: 14px;">
                    2026년도 좋은 일만 가득하시길 바랍니다! 🍀
                  </p>
                  <p style="margin: 0; color: #bbb; font-size: 12px;">
                    2026 럭키 픽 | Made with 💕
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    // 테스트 모드에서는 이메일 발송을 시뮬레이션
    if (!process.env.RESEND_API_KEY) {
      console.log('Test mode: Email would be sent to', email);
      console.log('Fortune:', fortune.title);

      return NextResponse.json({
        success: true,
        message: '이메일이 발송되었습니다 (테스트 모드)',
        testMode: true,
      });
    }

    // 실제 이메일 발송
    const { data, error } = await resend.emails.send({
      from: '2026 럭키 픽 <onboarding@resend.dev>',
      to: email,
      subject: `🐴 ${fortune.title} - 당신의 2026년 덕담`,
      html: emailHtml,
    });

    if (error) {
      console.error('Email sending error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '이메일이 발송되었습니다',
      emailId: data?.id,
    });
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
