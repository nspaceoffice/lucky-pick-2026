import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: '로그아웃 성공',
  });

  // 쿠키 삭제
  response.cookies.delete('admin_token');

  return response;
}
