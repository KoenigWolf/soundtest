'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SoundVisualizerProps {
  value: number;
  max: number;
  isRecording: boolean;
}

export function SoundVisualizer({ value, max, isRecording }: SoundVisualizerProps) {
  const percentage = (value / max) * 100;

  return (
    <div className="w-full h-24 bg-secondary rounded-lg overflow-hidden relative">
      <motion.div
        className={cn(
          "absolute bottom-0 left-0 w-full bg-primary",
          !isRecording && "opacity-50"
        )}
        initial={{ height: '0%' }}
        animate={{ height: `${percentage}%` }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={cn(
          "w-3 h-3 rounded-full transition-colors",
          isRecording ? "bg-green-500" : "bg-gray-400"
        )} />
      </div>
    </div>
  );
}