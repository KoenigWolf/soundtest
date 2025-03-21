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
    <Card className="p-6">
      <div className="space-y-4">
        {/* タイトルエリア：アイコンとタイトル文言 */}
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <h3 className="text-sm font-medium">Alert Threshold</h3>
        </div>
        {/* 閾値設定用スライダー */}
        <Slider
          value={[threshold]}
          onValueChange={handleSliderChange}
          max={120}
          step={1}
          className="w-full"
        />
        {/* 現在の閾値を表示 */}
        <div className="text-sm text-muted-foreground">
          Alert when sound level exceeds {threshold} dB
        </div>
      </div>
    </Card>
  );
}
