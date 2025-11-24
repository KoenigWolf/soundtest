'use client';

import { useCallback, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { WAVEFORM_CONFIG, MUSIC_GRADIENT_COLORS } from '@/lib/audio-constants';
import type { ColorMode } from '@/lib/audio-types';

interface WaveformVisualizerProps {
  analyser: AnalyserNode | null;
  isRecording: boolean;
  colorMode?: ColorMode;
  lineWidth?: number;
}

// キャンバスに波形を描画するコンポーネント
export function WaveformVisualizer({
  analyser,
  isRecording,
  colorMode = 'gradient',
  lineWidth = 3,
}: WaveformVisualizerProps) {
  // 現在のテーマを取得
  const { theme } = useTheme();
  // キャンバス要素の参照
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // requestAnimationFrame の ID を保持
  const animationFrameRef = useRef<number>();

  // 星の位置をメモ化（再レンダリング時に変更されないように）
  const stars = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 3,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスのサイズを調整する関数
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // グラデーション作成関数
    const createGradient = (
      ctx: CanvasRenderingContext2D,
      width: number,
      mode: ColorMode,
      computedStyle: CSSStyleDeclaration
    ): CanvasGradient => {
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      
      if (mode === 'gradient') {
        MUSIC_GRADIENT_COLORS.forEach(({ stop, color }) => {
          gradient.addColorStop(stop, color);
        });
      } else {
        const primary = computedStyle.getPropertyValue('--primary').trim();
        const primaryColor = primary ? `hsl(${primary})` : 'hsl(0 0% 9%)';
        gradient.addColorStop(0, primaryColor);
        gradient.addColorStop(1, primaryColor);
      }
      
      return gradient;
    };

    // 周波数バー描画関数
    const drawFrequencyBars = (
      ctx: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement,
      frequencyData: Uint8Array
    ) => {
      const barWidth = canvas.width / frequencyData.length;
      const barCount = Math.min(frequencyData.length, WAVEFORM_CONFIG.FREQUENCY_BAR_COUNT);

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * frequencyData.length);
        const barHeight = (frequencyData[dataIndex] / 255) * canvas.height * WAVEFORM_CONFIG.FREQUENCY_BAR_HEIGHT;

        // 音楽的なカラーバー
        const barGradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        const hue = (i / barCount) * 360;
        barGradient.addColorStop(0, `hsla(${hue}, 70%, 60%, 0.8)`);
        barGradient.addColorStop(1, `hsla(${hue}, 70%, 50%, 0.3)`);

        ctx.fillStyle = barGradient;
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 2, barHeight);
      }
    };

    // 波形を描画する関数
    const draw = () => {
      if (!isRecording || !analyser) {
        // 停止時またはanalyserがない場合はクリア
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // 停止時は中央線を表示
        ctx.strokeStyle = 'rgba(128, 128, 128, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        return;
      }

      // 次の描画フレームを要求
      animationFrameRef.current = requestAnimationFrame(draw);

      try {
        // 周波数データ取得用のバッファを作成
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);
        const frequencyData = new Uint8Array(analyser.frequencyBinCount);

        // 波形データを取得
        analyser.getFloatTimeDomainData(dataArray);
        analyser.getByteFrequencyData(frequencyData);

        // 画面をクリア（グラデーション背景）
        const computedStyle = getComputedStyle(document.documentElement);
        const bgColor = computedStyle.getPropertyValue('--card').trim();
        ctx.fillStyle = bgColor ? `hsl(${bgColor})` : 'hsl(0 0% 100%)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const centerY = canvas.height / 2;
        const sliceWidth = canvas.width / bufferLength;

        // 音楽的なグラデーションの設定
        const gradient = createGradient(ctx, canvas.width, colorMode, computedStyle);

        // 上下対称の波形を描画
        ctx.beginPath();
        ctx.moveTo(0, centerY);

        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] * WAVEFORM_CONFIG.AMPLIFICATION;
          const y = centerY + v * (centerY * WAVEFORM_CONFIG.HEIGHT_MULTIPLIER);
          ctx.lineTo(x, y);
          x += sliceWidth;
        }

        // 下側の波形を描画（上下対称）
        for (let i = bufferLength - 1; i >= 0; i--) {
          const v = dataArray[i] * WAVEFORM_CONFIG.AMPLIFICATION;
          const y = centerY - v * (centerY * WAVEFORM_CONFIG.HEIGHT_MULTIPLIER);
          ctx.lineTo(x, y);
          x -= sliceWidth;
        }

        ctx.closePath();

        // グラデーションで塗りつぶし
        ctx.fillStyle = gradient;
        ctx.fill();

        // 輪郭線を描画
        ctx.strokeStyle = gradient;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        // 周波数スペクトラムを背景に音楽的に表示
        if (frequencyData.length > 0 && isRecording) {
          drawFrequencyBars(ctx, canvas, frequencyData);
        }
      } catch (error) {
        console.error('Error in draw function:', error);
      }
    };

    // analyserが変更された場合のみアニメーションを開始
    if (analyser) {
      draw();
    } else {
      draw(); // analyserがない場合も静的な状態を描画
    }

    // クリーンアップ処理
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, isRecording, colorMode, lineWidth, theme]);

  return (
    <div className="relative w-full h-[400px] sm:h-[450px] lg:h-[500px] rounded-2xl overflow-hidden border-2 border-purple-500/20 shadow-2xl backdrop-blur-sm animate-hologram"
      style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(236, 72, 153, 0.08) 30%, rgba(59, 130, 246, 0.08) 60%, rgba(34, 197, 94, 0.08) 90%)',
        boxShadow: '0 0 50px rgba(139, 92, 246, 0.2), inset 0 0 50px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* 極彩色の宇宙背景 */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.4)_0%,rgba(236,72,153,0.3)_25%,rgba(59,130,246,0.2)_50%,transparent_70%)]" />
        {/* 動的な星 */}
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute w-0.5 h-0.5 bg-white rounded-full animate-cosmic-float"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>

      {/* 極彩色のオーロラオーバーレイ */}
      {isRecording && (
        <div className="absolute inset-0 animate-aurora-glow opacity-60" />
      )}
      
      {/* キャンバス：波形描画 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-10"
        style={{ opacity: isRecording ? 1 : 0.4 }}
      />
      
      {/* 中央線（音楽的なデザイン） */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
      </div>
      
      {/* 録音状態を示すインジケータ */}
      <div className="absolute top-4 right-4 z-20">
        <div
          className={cn(
            'w-5 h-5 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center',
            isRecording 
              ? 'bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse-slow ring-2 ring-green-400/50' 
              : 'bg-gray-400 opacity-50'
          )}
        >
          {isRecording && (
            <div className="w-2 h-2 rounded-full bg-white animate-ping" />
          )}
        </div>
      </div>
      
      {/* 録音状態テキスト（音楽的なデザイン） */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <div
          className={cn(
            'text-xs sm:text-sm font-semibold transition-all duration-300 px-3 py-1.5 rounded-full backdrop-blur-sm',
            isRecording 
              ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-100 border border-purple-400/50' 
              : 'bg-gray-800/30 text-gray-400 border border-gray-600/30'
          )}
        >
          {isRecording ? '🎵 ● Recording Live' : '○ Stopped'}
        </div>
      </div>
    </div>
  );
}

