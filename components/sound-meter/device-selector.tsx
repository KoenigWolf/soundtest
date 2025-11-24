'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mic } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { formatDeviceName } from '@/lib/audio-utils';

// Props 定義：デバイスリスト、選択中のデバイス、変更ハンドラ、無効状態
interface DeviceSelectorProps {
  devices: MediaDeviceInfo[];
  selectedDevice: string;
  onDeviceChange: (deviceId: string) => void;
  disabled?: boolean;
}

export function DeviceSelector({
  devices,
  selectedDevice,
  onDeviceChange,
  disabled,
}: DeviceSelectorProps) {
  // 選択されたデバイスがない場合は、最初のデバイスを使用
  const currentDevice = selectedDevice || (devices.length > 0 ? devices[0].deviceId : '');

  return (
    <div className="w-full max-w-sm mx-auto space-y-3">
      {/* デバイス選択用ラベルとセレクトボックス */}
      <div className="space-y-2.5">
        <Label htmlFor="microphone-select" className="text-sm sm:text-base font-medium flex items-center gap-2 text-foreground">
          <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
          Microphone Device
        </Label>
        <Select
          value={currentDevice}
          onValueChange={onDeviceChange}
          disabled={disabled}
          name="microphone-select"
        >
          <SelectTrigger id="microphone-select" className="w-full h-11 sm:h-12 border-2 rounded-lg shadow-sm">
            <SelectValue placeholder="Select a microphone" />
          </SelectTrigger>
          <SelectContent>
            {devices.map((device) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                <div className="flex items-center">
                  <Mic className="mr-2 h-4 w-4" />
                  {formatDeviceName(device)}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* 利用可能なマイクの数を表示 */}
      <p className="text-xs sm:text-sm text-muted-foreground text-center">
        {devices.length === 1 ? '1 microphone available' : `${devices.length} microphones available`}
      </p>
    </div>
  );
}
