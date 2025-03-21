'use client';

// Recharts コンポーネント群のインポート
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

// HistoryGraph の Props 定義
interface HistoryGraphProps {
  // 履歴データ：各データは時刻と音量値を含む
  data: { time: number; value: number }[]
  // アラート閾値（dB）：グラフ上に参照線を描画
  threshold: number
}

// HistoryGraph コンポーネント
// サウンドレベルの履歴を折れ線グラフで表示する
export function HistoryGraph({ data, threshold }: HistoryGraphProps) {
  // 時刻を秒単位でフォーマットする関数
  const formatTime = (time: number) => {
    const date = new Date(time)
    return `${date.getSeconds()}s`
  }

  return (
    <div className="w-full h-[200px]">
      {/* グラフのタイトル */}
      <h3 className="text-sm font-medium mb-4">Sound Level History</h3>
      {/* グラフをレスポンシブに表示 */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          {/* X 軸：時刻を表示し、フォーマット関数で秒表示 */}
          <XAxis
            dataKey="time"
            tickFormatter={formatTime}
            stroke="#888888"
            fontSize={12}
          />
          {/* Y 軸：dB 値（0～120）の範囲で表示 */}
          <YAxis
            stroke="#888888"
            fontSize={12}
            domain={[0, 120]}
            tickCount={5}
          />
          {/* 閾値を示す参照線 */}
          <ReferenceLine
            y={threshold}
            stroke="hsl(var(--destructive))"
            strokeDasharray="3 3"
          />
          {/* 履歴データの折れ線グラフ */}
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
  )
}
