'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import { Fortune, getRandomFortune, getCategoryColor } from '@/data/fortunes';

type Step = 'landing' | 'payment' | 'result';

export default function Home() {
  const [step, setStep] = useState<Step>('landing');
  const [fortune, setFortune] = useState<Fortune | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
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
    if (!cardRef.current || !fortune) return;

    setIsSaving(true);

    try {
      // 잠시 shimmer 효과 숨기기
      const shimmer = cardRef.current.querySelector('.shimmer-bg') as HTMLElement;
      if (shimmer) shimmer.style.display = 'none';

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#fff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      // shimmer 복원
      if (shimmer) shimmer.style.display = '';

      // 모바일/데스크톱 모두 지원
      const dataUrl = canvas.toDataURL('image/png');

      // iOS Safari 대응
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      if (isIOS) {
        // iOS에서는 새 탭에서 이미지 열기
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`<img src="${dataUrl}" style="max-width:100%"/>`);
          newWindow.document.title = '2026 럭키픽 - 길게 눌러서 저장하세요';
        }
      } else {
        // 일반 브라우저
        const link = document.createElement('a');
        link.download = `2026-럭키픽-${fortune.id}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      fireConfetti();
    } catch (error) {
      console.error('Image save failed:', error);
      alert('이미지 저장에 실패했습니다. 스크린샷을 이용해주세요.');
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
              ref={cardRef}
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
        className="absolute bottom-4 flex flex-col items-center"
      >
        <a
          href="https://instagram.com/socialjung"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 text-sm hover:text-pink-500 transition-colors"
        >
          Made by SOO
        </a>
      </motion.footer>
    </div>
  );
}
