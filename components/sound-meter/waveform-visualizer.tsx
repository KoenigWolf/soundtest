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

export function WaveformVisualizer({
  analyser,
  isRecording,
  colorMode = 'default',
  lineWidth = 2,
}: WaveformVisualizerProps) {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    
    const draw = () => {
      if (!isRecording) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getFloatTimeDomainData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (colorMode === 'gradient') {
        // Get computed colors from CSS variables
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

      ctx.lineWidth = lineWidth;
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] * 3; // Amplify the waveform
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
    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, isRecording, colorMode, lineWidth, theme]);

  return (
    <div className="relative w-full h-40 bg-card rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: isRecording ? 1 : 0.5 }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className={cn(
            "w-3 h-3 rounded-full",
            isRecording ? "bg-green-500" : "bg-gray-400"
          )}
          animate={{
            scale: isRecording ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 1,
            repeat: isRecording ? Infinity : 0,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}