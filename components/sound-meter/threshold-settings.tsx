'use client';

import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Bell } from 'lucide-react';

// 閾値設定用コンポーネントの Props 定義
interface ThresholdSettingsProps {
  threshold: number; // 現在の閾値（dB）
  onThresholdChange: (value: number) => void; // 閾値変更時のコールバック
}

// Alert Threshold 設定用コンポーネント
export function ThresholdSettings({
  threshold,
  onThresholdChange,
}: ThresholdSettingsProps) {
  // スライダーの値が変化したときの処理
  const handleSliderChange = ([value]: number[]) => {
    onThresholdChange(value);
  };

  return (
    // カードコンポーネント内に設定 UI を配置
    <Card className="p-6 sm:p-8 border-2 border-purple-500/30 shadow-xl bg-gradient-to-br from-purple-900/20 via-indigo-900/20 to-pink-900/20 backdrop-blur-sm h-full flex flex-col">
      <div className="space-y-6 sm:space-y-8 flex-1 flex flex-col">
        {/* タイトルエリア：アイコンとタイトル文言 */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-2.5 sm:p-3 rounded-xl bg-primary/10 shadow-sm">
            <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold">Alert Threshold</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Set warning level</p>
          </div>
        </div>
        {/* 閾値設定用スライダー */}
        <div className="space-y-3 sm:space-y-4 flex-1 flex flex-col justify-center">
          <Slider
            value={[threshold]}
            onValueChange={handleSliderChange}
            max={120}
            step={1}
            className="w-full"
          />
          {/* 現在の閾値を大きく表示 */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">0 dB</span>
            <span className="text-2xl sm:text-3xl font-bold tabular-nums text-foreground">{threshold} dB</span>
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">120 dB</span>
          </div>
        </div>
        {/* 説明テキスト */}
        <div className="text-sm sm:text-base text-muted-foreground bg-muted/50 p-4 sm:p-5 rounded-xl border border-border/50">
          Alert when sound level exceeds <strong className="text-foreground font-semibold">{threshold} dB</strong>
        </div>
      </div>
    </Card>
  );
}
