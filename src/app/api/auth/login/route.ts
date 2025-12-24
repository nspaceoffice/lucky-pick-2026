import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// 어드민 계정 정보 (환경변수로 관리 권장)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'socialjung@spacecloud.kr';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'gwill1430!!@@';
const JWT_SECRET = process.env.JWT_SECRET || 'lucky-pick-2026-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 인증 확인
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // JWT 토큰 생성 (24시간 유효)
    const token = jwt.sign(
      { email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const response = NextResponse.json({
      success: true,
      message: '로그인 성공',
    });

    // HttpOnly 쿠키로 토큰 저장
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24시간
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
