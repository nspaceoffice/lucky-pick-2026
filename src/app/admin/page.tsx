'use client';

import { useState, useEffect } from 'react';

interface Stats {
  totalVisitors: number;
  dailyStats: { date: string; count: number }[];
  countryStats: { country: string; count: number }[];
  referrerStats: { referrer: string; count: number }[];
  recentVisitors: {
    timestamp: number;
    date: string;
    ip: string;
    country: string;
    city: string;
    region: string;
    referrer: string;
    userAgent: string;
  }[];
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [period, setPeriod] = useState<'day' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));

  // 인증 상태 확인
  useEffect(() => {
    checkAuth();
  }, []);

  // 통계 로드
  useEffect(() => {
    if (isLoggedIn) {
      loadStats();
    }
  }, [isLoggedIn, period, selectedDate, selectedMonth]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify');
      if (response.ok) {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setIsLoggedIn(true);
      } else {
        setLoginError(data.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('로그인 처리 중 오류가 발생했습니다.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsLoggedIn(false);
      setStats(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const loadStats = async () => {
    try {
      const date = period === 'day' ? selectedDate : selectedMonth;
      const response = await fetch(`/api/analytics/stats?period=${period}&date=${date}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Stats load error:', error);
    }
  };

  const getCountryName = (code: string): string => {
    const countries: Record<string, string> = {
      KR: '한국',
      US: '미국',
      JP: '일본',
      CN: '중국',
      GB: '영국',
      DE: '독일',
      FR: '프랑스',
      unknown: '알 수 없음',
    };
    return countries[code] || code;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  // 로그인 화면
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            🔐 Admin Login
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="이메일 입력"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="비밀번호 입력"
                required
              />
            </div>
            {loginError && (
              <div className="text-red-500 text-sm text-center">{loginError}</div>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              로그인
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 어드민 대시보드
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">
            📊 2026 럭키 픽 Admin
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Period Selector */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('day')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === 'day'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              일간
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === 'month'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              월간
            </button>
          </div>

          {period === 'day' ? (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
          ) : (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Total Visitors */}
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-sm text-gray-500 mb-1">
              {period === 'day' ? '오늘' : '이번 달'} 방문자
            </div>
            <div className="text-4xl font-bold text-pink-500">
              {stats?.totalVisitors?.toLocaleString() || 0}
            </div>
          </div>

          {/* Country Stats */}
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-sm text-gray-500 mb-3">접속 지역 TOP 5</div>
            {stats?.countryStats?.slice(0, 5).map((item, index) => (
              <div key={index} className="flex justify-between items-center py-1">
                <span className="text-gray-700">{getCountryName(item.country)}</span>
                <span className="font-medium text-pink-500">{item.count}</span>
              </div>
            )) || <div className="text-gray-400">데이터 없음</div>}
          </div>

          {/* Referrer Stats */}
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-sm text-gray-500 mb-3">접속 경로 TOP 5</div>
            {stats?.referrerStats?.slice(0, 5).map((item, index) => (
              <div key={index} className="flex justify-between items-center py-1">
                <span className="text-gray-700 truncate max-w-[150px]">
                  {item.referrer === 'direct' ? '직접 접속' : item.referrer}
                </span>
                <span className="font-medium text-pink-500">{item.count}</span>
              </div>
            )) || <div className="text-gray-400">데이터 없음</div>}
          </div>
        </div>

        {/* Daily Chart (for monthly view) */}
        {period === 'month' && stats?.dailyStats && stats.dailyStats.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow mb-6">
            <div className="text-sm text-gray-500 mb-4">일별 방문자 추이</div>
            <div className="flex items-end gap-1 h-40 overflow-x-auto">
              {stats.dailyStats.map((item, index) => {
                const maxCount = Math.max(...stats.dailyStats.map(d => d.count), 1);
                const height = (item.count / maxCount) * 100;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center min-w-[20px]"
                  >
                    <div
                      className="w-4 bg-pink-400 rounded-t hover:bg-pink-500 transition-colors"
                      style={{ height: `${Math.max(height, 2)}%` }}
                      title={`${item.date}: ${item.count}명`}
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      {item.date.split('-')[2]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Visitors */}
        <div className="bg-white rounded-xl p-6 shadow">
          <div className="text-sm text-gray-500 mb-4">최근 방문자 (최대 20명)</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 text-gray-500">시간</th>
                  <th className="text-left py-2 px-2 text-gray-500">국가</th>
                  <th className="text-left py-2 px-2 text-gray-500">도시</th>
                  <th className="text-left py-2 px-2 text-gray-500">접속 경로</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentVisitors?.map((visitor, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2 text-gray-600">
                      {new Date(visitor.timestamp).toLocaleString('ko-KR')}
                    </td>
                    <td className="py-2 px-2 text-gray-600">
                      {getCountryName(visitor.country)}
                    </td>
                    <td className="py-2 px-2 text-gray-600">
                      {visitor.city !== 'unknown' ? visitor.city : '-'}
                    </td>
                    <td className="py-2 px-2 text-gray-600 truncate max-w-[200px]">
                      {visitor.referrer === 'direct' ? '직접 접속' : visitor.referrer}
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-400">
                      데이터 없음
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Setup Notice */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
          <strong>⚠️ 설정 필요:</strong> 방문자 추적 기능을 사용하려면 Vercel KV를 설정해야 합니다.
          <br />
          Vercel 대시보드 → Storage → Create Database → KV 선택 후 프로젝트에 연결하세요.
        </div>
      </main>
    </div>
  );
}
