/**
 * オーディオ処理に関する型定義
 */

export interface HistoryDataPoint {
  time: number;
  value: number;
}

export interface AudioDeviceInfo {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export type ColorMode = 'default' | 'gradient';

export interface SoundMeterState {
  isRecording: boolean;
  decibels: number;
  error: string | null;
  devices: MediaDeviceInfo[];
  selectedDevice: string | undefined;
  threshold: number;
  history: HistoryDataPoint[];
  colorMode: ColorMode;
}

