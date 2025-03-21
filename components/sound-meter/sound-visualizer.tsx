'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// 音量ビジュアライザーコンポーネントの Props 定義
interface SoundVisualizerProps {
  value: number; // 現在の音量値
  max: number;   // 音量の最大値
  isRecording: boolean; // 録音中かどうかのフラグ
}

// 音量のビジュアル表示を行うコンポーネント
export function SoundVisualizer({
  value,
  max,
  isRecording,
}: SoundVisualizerProps) {
  // 現在の音量をパーセンテージに変換
  const percentage = (value / max) * 100;

  return (
    // ビジュアライザー全体のラッパー
    <div className="w-full h-24 bg-secondary rounded-lg overflow-hidden relative">
      {/* 録音中の音量レベルをアニメーションで表示 */}
      <motion.div
        className={cn(
          'absolute bottom-0 left-0 w-full bg-primary',
          !isRecording && 'opacity-50'
        )}
        initial={{ height: '0%' }}
        animate={{ height: `${percentage}%` }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      />
      {/* 録音状態を示すインジケータ */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            'w-3 h-3 rounded-full transition-colors',
            isRecording ? 'bg-green-500' : 'bg-gray-400'
          )}
        />
      </div>
    </div>
  );
}
