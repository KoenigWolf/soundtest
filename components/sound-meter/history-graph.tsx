'use client';

import { useEffect, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface HistoryGraphProps {
  data: { time: number; value: number }[];
  threshold: number;
}

export function HistoryGraph({ data, threshold }: HistoryGraphProps) {
  const formatTime = (time: number) => {
    const date = new Date(time);
    return `${date.getSeconds()}s`;
  };

  return (
    <div className="w-full h-[200px]">
      <h3 className="text-sm font-medium mb-4">Sound Level History</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis
            dataKey="time"
            tickFormatter={formatTime}
            stroke="#888888"
            fontSize={12}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            domain={[0, 120]}
            tickCount={5}
          />
          <ReferenceLine
            y={threshold}
            stroke="hsl(var(--destructive))"
            strokeDasharray="3 3"
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}