import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

interface VisitorData {
  timestamp: number;
  date: string;
  ip: string;
  country: string;
  city: string;
  region: string;
  referrer: string;
  userAgent: string;
  path: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referrer, path } = body;

    // IP와 지역 정보 가져오기 (Vercel 헤더에서)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';
    const country = request.headers.get('x-vercel-ip-country') || 'unknown';
    const city = request.headers.get('x-vercel-ip-city') || 'unknown';
    const region = request.headers.get('x-vercel-ip-country-region') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const now = new Date();
    const dateKey = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const monthKey = dateKey.substring(0, 7); // YYYY-MM

    const visitorData: VisitorData = {
      timestamp: now.getTime(),
      date: dateKey,
      ip,
      country,
      city,
      region,
      referrer: referrer || 'direct',
      userAgent,
      path: path || '/',
    };

    // Vercel KV에 저장
    // 일별 방문자 수 증가
    await kv.incr(`visitors:${dateKey}`);

    // 월별 방문자 수 증가
    await kv.incr(`visitors:month:${monthKey}`);

    // 국가별 통계
    await kv.incr(`visitors:country:${dateKey}:${country}`);

    // 경로별 통계
    const referrerKey = referrer ? new URL(referrer).hostname : 'direct';
    await kv.incr(`visitors:referrer:${dateKey}:${referrerKey}`);

    // 최근 방문자 목록에 추가 (최대 100개 유지)
    await kv.lpush('visitors:recent', JSON.stringify(visitorData));
    await kv.ltrim('visitors:recent', 0, 99);

    // 일별 상세 데이터 저장
    await kv.lpush(`visitors:detail:${dateKey}`, JSON.stringify(visitorData));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics track error:', error);
    // KV 연결 실패해도 사이트는 정상 작동하도록
    return NextResponse.json({ success: false, error: 'Tracking failed' });
  }
}
