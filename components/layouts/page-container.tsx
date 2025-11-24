'use client';

import { useMemo } from 'react';
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const STAR_COUNT = 50;
const MUSIC_SYMBOLS = [
  { symbol: '♪', position: 'top-1/4 left-1/4', size: 'text-4xl', color: 'text-purple-300/30', delay: '2s' },
  { symbol: '♫', position: 'top-3/4 right-1/4', size: 'text-3xl', color: 'text-pink-300/30', delay: '4s' },
  { symbol: '♬', position: 'top-1/2 left-1/2', size: 'text-2xl', color: 'text-indigo-300/30', delay: '6s' },
] as const;

/**
 * PageContainer コンポーネント
 * ページ全体のレイアウトを一貫して提供するコンテナ
 * オプションのタイトルを表示し、コンテンツを中央揃えにします。
 */
export const PageContainer = ({
  children,
  title,
  className,
}: PageContainerProps) => {
  // 星の位置をメモ化（再レンダリング時に変更されないように）
  const stars = useMemo(() => {
    return Array.from({ length: STAR_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 6,
      duration: 4 + Math.random() * 4,
    }));
  }, []);

  return (
    <div
      className={cn(
        "min-h-screen w-full relative overflow-hidden",
        "bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950",
        "dark:from-purple-950 dark:via-slate-900 dark:to-indigo-950",
        className
      )}
      style={{
        backgroundImage: `
          radial-gradient(at 20% 80%, rgba(120, 119, 198, 0.3) 0px, transparent 50%),
          radial-gradient(at 80% 20%, rgba(255, 119, 198, 0.3) 0px, transparent 50%),
          radial-gradient(at 40% 40%, rgba(120, 219, 255, 0.2) 0px, transparent 50%),
          linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.1) 100%)
        `,
      }}
    >
      {/* 動的な宇宙パターン */}
      <div className="absolute inset-0 opacity-40">
        {/* 星のパターン */}
        <div className="absolute inset-0">
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute w-1 h-1 bg-white rounded-full animate-cosmic-float"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
              }}
            />
          ))}
        </div>
        {/* 音楽記号パターン */}
        <div className="absolute inset-0 opacity-20">
          {MUSIC_SYMBOLS.map((symbol, i) => (
            <div
              key={i}
              className={cn(
                'absolute animate-cosmic-float',
                symbol.position,
                symbol.size,
                symbol.color
              )}
              style={{ animationDelay: symbol.delay }}
            >
              {symbol.symbol}
            </div>
          ))}
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 max-w-7xl relative z-10">
        {/* タイトルが提供されている場合、見出しとして表示 */}
        {title && (
          <div className="mb-12 sm:mb-16 text-center animate-fade-in-down">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 tracking-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                {title}
              </span>
            </h1>
            <p className="text-purple-200/80 dark:text-purple-300/80 text-sm sm:text-base max-w-2xl mx-auto font-medium">
              ✨ Real-time audio waveform visualization for music artists ✨
            </p>
          </div>
        )}
        {/* 子要素をレンダリング */}
        <div className="w-full animate-fade-in-up">
          {children}
        </div>
      </div>
    </div>
  )
}
