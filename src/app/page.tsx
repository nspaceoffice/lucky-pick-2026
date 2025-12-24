'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Fortune, getRandomFortune, getCategoryColor } from '@/data/fortunes';

type Step = 'landing' | 'payment' | 'result';

export default function Home() {
  const [step, setStep] = useState<Step>('landing');
  const [fortune, setFortune] = useState<Fortune | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 방문자 추적
    const trackVisitor = async () => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Tracking error:', error);
      }
    };
    trackVisitor();
  }, []);

  const fireConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#ff6b9d', '#c44dff', '#6c5ce7', '#ffd700', '#00d2d3'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const handlePayment = async () => {
    setIsLoading(true);

    // 결제 시뮬레이션 (실제로는 토스 페이먼츠 SDK 사용)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 랜덤 덕담 선택
    const selectedFortune = getRandomFortune();
    setFortune(selectedFortune);
    setStep('result');
    setIsLoading(false);

    // 폭죽 효과
    setTimeout(fireConfetti, 300);
  };

  const handleSaveImage = async () => {
    if (!fortune) return;

    setIsSaving(true);

    try {
      // Canvas로 직접 카드 그리기
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // 카드 크기 설정
      const width = 600;
      const height = 700;
      canvas.width = width;
      canvas.height = height;

      // 배경 그라데이션
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(1, '#ffeef8');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 둥근 테두리 효과
      ctx.strokeStyle = '#ffb6c1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(10, 10, width - 20, height - 20, 20);
      ctx.stroke();

      // 카테고리 뱃지 배경
      const categoryColors: Record<string, string> = {
        idiom: '#f59e0b',
        bible: '#3b82f6',
        talmud: '#10b981',
        korean: '#ec4899',
        modern: '#8b5cf6',
      };
      ctx.fillStyle = categoryColors[fortune.category] || '#ec4899';
      ctx.beginPath();
      ctx.roundRect(width/2 - 60, 40, 120, 32, 16);
      ctx.fill();

      // 카테고리 텍스트
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Pretendard, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(fortune.categoryLabel, width/2, 62);

      // 이모지
      ctx.font = '80px serif';
      ctx.fillText(fortune.emoji, width/2, 170);

      // 제목
      ctx.fillStyle = '#1a1a2e';
      ctx.font = 'bold 24px Pretendard, sans-serif';
      ctx.fillText(fortune.title, width/2, 240);

      // 메시지 (줄바꿈 처리)
      ctx.fillStyle = '#555555';
      ctx.font = '18px Pretendard, sans-serif';
      const words = fortune.message.split(' ');
      let line = '';
      let y = 300;
      const maxWidth = width - 80;

      for (const word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== '') {
          ctx.fillText(line.trim(), width/2, y);
          line = word + ' ';
          y += 30;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), width/2, y);

      // 번호
      ctx.fillStyle = '#ffb6c1';
      ctx.font = 'bold 16px Pretendard, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`#${fortune.id}`, width - 40, 60);

      // 하단 로고
      ctx.fillStyle = '#999999';
      ctx.font = '14px Pretendard, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('2026 럭키 픽 🐴', width/2, height - 55);

      // Made by SOO
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '12px Pretendard, sans-serif';
      ctx.fillText('Made by SOO', width/2, height - 30);

      // 이미지 다운로드
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `2026-럭키픽-${fortune.id}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Image save failed:', error);
      alert('이미지 저장에 실패했습니다.');
    }

    setIsSaving(false);
  };

  const handleRetry = () => {
    setStep('landing');
    setFortune(null);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Decorative floating elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 text-6xl animate-float opacity-60">🐴</div>
        <div className="absolute top-40 right-16 text-4xl animate-float-slow opacity-50" style={{ animationDelay: '0.5s' }}>✨</div>
        <div className="absolute bottom-32 left-20 text-5xl animate-float opacity-40" style={{ animationDelay: '1s' }}>🍀</div>
        <div className="absolute bottom-20 right-10 text-4xl animate-float-slow opacity-50" style={{ animationDelay: '1.5s' }}>🎊</div>
        <div className="absolute top-1/3 left-1/4 text-3xl animate-sparkle opacity-30">⭐</div>
        <div className="absolute top-1/2 right-1/4 text-3xl animate-sparkle opacity-30" style={{ animationDelay: '0.7s' }}>🌟</div>
      </div>

      <AnimatePresence mode="wait">
        {/* Landing Step */}
        {step === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center text-center max-w-md z-10"
          >
            {/* Horse mascot */}
            <motion.div
              className="text-8xl mb-6"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              🐴
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text leading-tight">
              2026 럭키 픽
            </h1>

            <p className="text-xl text-gray-600 mb-2">
              병오년(말띠 해) 특별 운세
            </p>

            <p className="text-lg text-gray-500 mb-8">
              당신의 2026년을 완벽하게 만들<br />
              운명의 한 마디, 지금 확인하세요!
            </p>

            <div className="fortune-card p-6 mb-8 w-full">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-2xl">🎴</span>
                <span className="font-bold text-lg text-pink-500">덕담 뽑기</span>
              </div>
              <p className="text-gray-600 text-sm">
                사자성어, 성경, 탈무드, 한국 덕담, 현대 명언<br />
                100가지 중 당신만의 특별한 한 마디!
              </p>
            </div>

            <motion.button
              onClick={() => setStep('payment')}
              className="lucky-button text-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🎰 덕담 뽑으러 가기
            </motion.button>

            <p className="text-gray-400 text-sm mt-4">
              복채 1,000원 (테스트 모드)
            </p>
          </motion.div>
        )}

        {/* Payment Step */}
        {step === 'payment' && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fortune-card p-8 max-w-md w-full z-10"
          >
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce-gentle">💸</div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">복채 내기</h2>
              <p className="text-gray-500 mb-6">
                정성스러운 복채로<br />
                더 좋은 덕담이 찾아와요!
              </p>

              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 mb-6">
                <p className="text-3xl font-bold text-pink-500 mb-2">1,000원</p>
                <p className="text-sm text-gray-500">테스트 결제 (실제 결제 X)</p>
              </div>

              <motion.button
                onClick={handlePayment}
                disabled={isLoading}
                className="lucky-button w-full mb-4 disabled:opacity-50"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      🔮
                    </motion.span>
                    운명을 읽는 중...
                  </span>
                ) : (
                  '💳 토스로 결제하기'
                )}
              </motion.button>

              <button
                onClick={() => setStep('landing')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← 돌아가기
              </button>
            </div>
          </motion.div>
        )}

        {/* Result Step */}
        {step === 'result' && fortune && (
          <motion.div
            key="result"
            initial={{ opacity: 0, rotateY: 180 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="flex flex-col items-center max-w-md w-full z-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              당신의 2026년 덕담
            </h2>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="fortune-card p-8 w-full relative overflow-hidden"
            >
              {/* Category badge */}
              <div className={`inline-block px-4 py-1 rounded-full bg-gradient-to-r ${getCategoryColor(fortune.category)} text-white text-sm font-bold mb-4`}>
                {fortune.categoryLabel}
              </div>

              {/* Emoji */}
              <div className="text-6xl mb-4">{fortune.emoji}</div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                {fortune.title}
              </h3>

              {/* Message */}
              <p className="text-lg text-gray-600 leading-relaxed">
                {fortune.message}
              </p>

              {/* Fortune number */}
              <div className="absolute top-4 right-4 text-pink-200 font-bold text-lg">
                #{fortune.id}
              </div>

              {/* Decorative shimmer */}
              <div className="absolute inset-0 shimmer-bg pointer-events-none"></div>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full">
              <motion.button
                onClick={handleSaveImage}
                disabled={isSaving}
                className="lucky-button flex-1 disabled:opacity-50"
                whileHover={{ scale: isSaving ? 1 : 1.02 }}
                whileTap={{ scale: isSaving ? 1 : 0.98 }}
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      💾
                    </motion.span>
                    저장 중...
                  </span>
                ) : (
                  '📥 이미지로 저장'
                )}
              </motion.button>

              <motion.button
                onClick={handleRetry}
                className="px-6 py-4 rounded-full border-2 border-pink-300 text-pink-500 font-bold hover:bg-pink-50 transition-colors flex-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🔄 다시 뽑기
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 flex flex-col items-center"
      >
        <a
          href="https://instagram.com/socialjung"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 text-base font-medium underline underline-offset-4 decoration-pink-300 hover:text-pink-500 hover:decoration-pink-500 transition-colors"
        >
          Made by SOO
        </a>
      </motion.footer>
    </div>
  );
}
