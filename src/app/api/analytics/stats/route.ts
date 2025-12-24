import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { kv } from '@vercel/kv';

const JWT_SECRET = process.env.JWT_SECRET || 'lucky-pick-2026-secret-key-change-in-production';

// 인증 확인 헬퍼
function verifyAuth(request: NextRequest): boolean {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token) return false;
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  // 인증 확인
  if (!verifyAuth(request)) {
    return NextResponse.json(
      { success: false, error: '인증이 필요합니다.' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'day'; // day, month
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const results: {
      totalVisitors: number;
      dailyStats: { date: string; count: number }[];
      countryStats: { country: string; count: number }[];
      referrerStats: { referrer: string; count: number }[];
      recentVisitors: unknown[];
    } = {
      totalVisitors: 0,
      dailyStats: [],
      countryStats: [],
      referrerStats: [],
      recentVisitors: [],
    };

    if (period === 'month') {
      // 월간 통계
      const monthKey = date.substring(0, 7); // YYYY-MM
      const year = parseInt(monthKey.split('-')[0]);
      const month = parseInt(monthKey.split('-')[1]);
      const daysInMonth = new Date(year, month, 0).getDate();

      let totalMonthVisitors = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = day.toString().padStart(2, '0');
        const dayKey = `${monthKey}-${dayStr}`;
        const count = await kv.get<number>(`visitors:${dayKey}`) || 0;
        results.dailyStats.push({ date: dayKey, count });
        totalMonthVisitors += count;
      }

      results.totalVisitors = totalMonthVisitors;

      // 월간 국가별 통계 집계
      const countryMap = new Map<string, number>();
      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = day.toString().padStart(2, '0');
        const dayKey = `${monthKey}-${dayStr}`;
        const keys = await kv.keys(`visitors:country:${dayKey}:*`);
        for (const key of keys) {
          const country = key.split(':').pop() || 'unknown';
          const count = await kv.get<number>(key) || 0;
          countryMap.set(country, (countryMap.get(country) || 0) + count);
        }
      }
      results.countryStats = Array.from(countryMap.entries())
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count);

      // 월간 referrer 통계 집계
      const referrerMap = new Map<string, number>();
      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = day.toString().padStart(2, '0');
        const dayKey = `${monthKey}-${dayStr}`;
        const keys = await kv.keys(`visitors:referrer:${dayKey}:*`);
        for (const key of keys) {
          const referrer = key.split(':').pop() || 'direct';
          const count = await kv.get<number>(key) || 0;
          referrerMap.set(referrer, (referrerMap.get(referrer) || 0) + count);
        }
      }
      results.referrerStats = Array.from(referrerMap.entries())
        .map(([referrer, count]) => ({ referrer, count }))
        .sort((a, b) => b.count - a.count);

    } else {
      // 일간 통계
      results.totalVisitors = await kv.get<number>(`visitors:${date}`) || 0;
      results.dailyStats = [{ date, count: results.totalVisitors }];

      // 국가별 통계
      const countryKeys = await kv.keys(`visitors:country:${date}:*`);
      for (const key of countryKeys) {
        const country = key.split(':').pop() || 'unknown';
        const count = await kv.get<number>(key) || 0;
        results.countryStats.push({ country, count });
      }
      results.countryStats.sort((a, b) => b.count - a.count);

      // Referrer 통계
      const referrerKeys = await kv.keys(`visitors:referrer:${date}:*`);
      for (const key of referrerKeys) {
        const referrer = key.split(':').pop() || 'direct';
        const count = await kv.get<number>(key) || 0;
        results.referrerStats.push({ referrer, count });
      }
      results.referrerStats.sort((a, b) => b.count - a.count);
    }

    // 최근 방문자 (최대 20명)
    const recentData = await kv.lrange('visitors:recent', 0, 19);
    results.recentVisitors = recentData.map((item) => {
      try {
        return typeof item === 'string' ? JSON.parse(item) : item;
      } catch {
        return item;
      }
    });

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { success: false, error: '통계 조회 중 오류가 발생했습니다.', details: String(error) },
      { status: 500 }
    );
  }
}
