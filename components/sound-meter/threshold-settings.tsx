'use client';

import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Bell } from 'lucide-react';

interface ThresholdSettingsProps {
  threshold: number;
  onThresholdChange: (value: number) => void;
}

export function ThresholdSettings({
  threshold,
  onThresholdChange
}: ThresholdSettingsProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <h3 className="text-sm font-medium">Alert Threshold</h3>
        </div>
        <Slider
          value={[threshold]}
          onValueChange={([value]) => onThresholdChange(value)}
          max={120}
          step={1}
          className="w-full"
        />
        <div className="text-sm text-muted-foreground">
          Alert when sound level exceeds {threshold} dB
        </div>
      </div>
    </Card>
  );
}