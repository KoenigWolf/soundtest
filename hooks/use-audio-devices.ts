/**
 * オーディオデバイス管理のカスタムフック
 */

import { useEffect, useState } from 'react';
import { getErrorMessage } from '@/lib/audio-errors';

interface UseAudioDevicesReturn {
  devices: MediaDeviceInfo[];
  selectedDevice: string | undefined;
  setSelectedDevice: (deviceId: string) => void;
  error: string | null;
}

export function useAudioDevices(): UseAudioDevicesReturn {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function setupDevices() {
      try {
        // 最初にマイクアクセスを要求してラベル付きデバイス情報を取得
        const initialStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = mediaDevices.filter(d => d.kind === 'audioinput');
        
        setDevices(audioDevices);

        // 利用可能なデバイスがあれば、最初のデバイスを選択
        if (audioDevices.length > 0 && !selectedDevice) {
          setSelectedDevice(audioDevices[0].deviceId);
        }

        // 初期ストリームのトラックを停止
        initialStream.getTracks().forEach(track => track.stop());
      } catch (err) {
        const errorMessage = getErrorMessage(err, 'DEVICE_ENUMERATION_FAILED');
        setError(errorMessage);
        console.error('Device setup error:', err);
      }
    }

    setupDevices();
  }, [selectedDevice]);

  return {
    devices,
    selectedDevice,
    setSelectedDevice,
    error,
  };
}

