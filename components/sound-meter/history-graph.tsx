'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { HistoryDataPoint } from '@/lib/audio-types';

interface HistoryGraphProps {
  data: HistoryDataPoint[];
  threshold: number;
}

/**
 * HistoryGraph コンポーネント
 * サウンドレベルの履歴を折れ線グラフで表示する
 */
export function HistoryGraph({ data, threshold }: HistoryGraphProps) {
  // 時刻を秒単位でフォーマットする関数（メモ化）
  const formatTime = useMemo(
    () => (time: number) => {
      const date = new Date(time);
      return `${date.getSeconds()}s`;
    },
    []
  );

  return (
    <div className="w-full flex flex-col h-full min-h-[250px]">
      {/* グラフのタイトル */}
      <div className="mb-4 flex-shrink-0">
        <h3 className="text-base font-semibold mb-1">Sound Level History</h3>
        <p className="text-xs text-muted-foreground">Last 60 seconds</p>
      </div>
      {/* グラフをレスポンシブに表示 */}
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
            {/* X 軸：時刻を表示し、フォーマット関数で秒表示 */}
            <XAxis
              dataKey="time"
              tickFormatter={formatTime}
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            {/* Y 軸：dB 値（0～120）の範囲で表示 */}
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              domain={[0, 120]}
              tickCount={6}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            {/* 閾値を示す参照線 */}
            <ReferenceLine
              y={threshold}
              stroke="hsl(var(--destructive))"
              strokeDasharray="4 4"
              strokeWidth={2}
              label={{ 
                value: `${threshold}dB`, 
                position: 'right', 
                fill: 'hsl(var(--destructive))', 
                fontSize: 10,
                offset: 5
              }}
            />
            {/* 履歴データの折れ線グラフ */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
              strokeLinecap="round"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
