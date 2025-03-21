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

  // デバイス名のフォーマット関数
  const formatDeviceName = (device: MediaDeviceInfo) => {
    if (device.label) {
      // MacBook の内蔵マイクの場合、シンプルな名称にする
      if (device.label.includes('Built-in') || device.label.includes('MacBook')) {
        return 'Built-in Microphone';
      }
      return device.label;
    }
    // ラベルがない場合、デバイスIDの一部を表示
    return `Microphone ${device.deviceId.slice(0, 8)}`;
  };

  return (
    <div className="w-full max-w-sm space-y-2">
      {/* デバイス選択用ラベルとセレクトボックス */}
      <div className="space-y-1">
        <Label htmlFor="microphone-select">Microphone</Label>
        <Select
          value={currentDevice}
          onValueChange={onDeviceChange}
          disabled={disabled}
          name="microphone-select"
        >
          <SelectTrigger id="microphone-select" className="w-full">
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
      <p className="text-xs text-muted-foreground">
        {devices.length === 1 ? '1 microphone available' : `${devices.length} microphones available`}
      </p>
    </div>
  );
}
