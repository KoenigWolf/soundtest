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
  disabled
}: DeviceSelectorProps) {
  // Make sure we have a non-empty value
  if (!selectedDevice && devices.length > 0) {
    selectedDevice = devices[0].deviceId;
  }
  
  // Helper function to format device names
  const formatDeviceName = (device: MediaDeviceInfo) => {
    if (device.label) {
      // For MacBook built-in mic, simplify the name
      if (device.label.includes('Built-in') || device.label.includes('MacBook')) {
        return 'Built-in Microphone';
      }
      return device.label;
    }
    return `Microphone ${device.deviceId.slice(0, 8)}`;
  };
  
  return (
    <div className="w-full max-w-sm space-y-2">
      <div className="space-y-1">
        <Label htmlFor="microphone-select">Microphone</Label>
        <Select
          value={selectedDevice}
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
      <p className="text-xs text-muted-foreground">
        {devices.length === 1 ? '1 microphone available' : `${devices.length} microphones available`}
      </p>
    </div>
  );
}