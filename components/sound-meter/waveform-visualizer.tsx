'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface WaveformVisualizerProps {
  analyser: AnalyserNode | null;
  isRecording: boolean;
  colorMode?: 'default' | 'gradient';
  lineWidth?: number;
}

// キャンバスに波形を描画するコンポーネント
export function WaveformVisualizer({
  analyser,
  isRecording,
  colorMode = 'default',
  lineWidth = 2,
}: WaveformVisualizerProps) {
  // 現在のテーマを取得
  const { theme } = useTheme();
  // キャンバス要素の参照
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // requestAnimationFrame の ID を保持
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 周波数データ取得用のバッファを作成
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    // 波形を描画する関数
    const draw = () => {
      if (!isRecording) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      // 次の描画フレームを要求
      animationFrameRef.current = requestAnimationFrame(draw);
      // 波形データを取得
      analyser.getFloatTimeDomainData(dataArray);
      // 画面をクリア
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 描画色の設定
      if (colorMode === 'gradient') {
        const computedStyle = getComputedStyle(document.documentElement);
        const color1 = `hsl(${computedStyle.getPropertyValue('--chart-1')})`;
        const color2 = `hsl(${computedStyle.getPropertyValue('--chart-2')})`;
        const color3 = `hsl(${computedStyle.getPropertyValue('--chart-3')})`;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(0.5, color2);
        gradient.addColorStop(1, color3);
        ctx.strokeStyle = gradient;
      } else {
        const computedStyle = getComputedStyle(document.documentElement);
        ctx.strokeStyle = `hsl(${computedStyle.getPropertyValue('--primary')})`;
      }

      // 線の幅と開始設定
      ctx.lineWidth = lineWidth;
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      // 波形の各点を描画
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] * 3; // 波形を増幅
        const y = (canvas.height / 2) * (1 + v);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    // キャンバスのサイズを調整する関数
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      // 描画コンテキストのスケールを調整
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    draw();

    // クリーンアップ処理
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, isRecording, colorMode, lineWidth, theme]);

  return (
    <div className="relative w-full h-40 bg-card rounded-lg overflow-hidden">
      {/* キャンバス：波形描画 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: isRecording ? 1 : 0.5 }}
      />
      {/* 録音状態を示すインジケータ */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className={cn(
            'w-3 h-3 rounded-full',
            isRecording ? 'bg-green-500' : 'bg-gray-400'
          )}
          animate={{ scale: isRecording ? [1, 1.2, 1] : 1 }}
          transition={{
            duration: 1,
            repeat: isRecording ? Infinity : 0,
            ease: 'easeInOut',
          }}
        />
      </div>
    </div>
  );
}
