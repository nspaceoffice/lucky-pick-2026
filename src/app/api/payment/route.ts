import { NextRequest, NextResponse } from 'next/server';

// Toss Payments 테스트 키 (실제 운영 시 환경변수로 관리)
const TOSS_CLIENT_KEY = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';
const TOSS_SECRET_KEY = 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, orderId, orderName } = body;

    // 결제 요청 데이터 생성
    const paymentData = {
      amount,
      orderId,
      orderName,
      successUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payment/success`,
      failUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payment/fail`,
    };

    return NextResponse.json({
      success: true,
      clientKey: TOSS_CLIENT_KEY,
      paymentData,
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { success: false, error: 'Payment initialization failed' },
      { status: 500 }
    );
  }
}

// 결제 승인 처리 (테스트용 간소화)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentKey, orderId, amount } = body;

    // 테스트 모드에서는 항상 성공 처리
    // 실제 운영 시에는 토스 API로 결제 승인 요청
    /*
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(TOSS_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });
    */

    return NextResponse.json({
      success: true,
      message: '결제가 완료되었습니다 (테스트 모드)',
      orderId,
      amount,
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { success: false, error: 'Payment confirmation failed' },
      { status: 500 }
    );
  }
}
