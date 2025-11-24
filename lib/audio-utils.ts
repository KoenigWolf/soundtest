/**
 * オーディオ処理に関するユーティリティ関数
 */

import { DB_RANGE, WAVEFORM_CONFIG } from './audio-constants';
import type { HistoryDataPoint } from './audio-types';

/**
 * RMS（平方根平均二乗）を計算
 */
export function calculateRMS(dataArray: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i] * dataArray[i];
  }
  return Math.sqrt(sum / dataArray.length);
}

/**
 * RMSをdB値に変換し、0～120の範囲に正規化
 */
export function rmsToDecibels(rms: number): number {
  const db = 20 * Math.log10(Math.max(rms, 1e-6));
  return Math.max(DB_RANGE.MIN, Math.min(DB_RANGE.MAX, db + DB_RANGE.OFFSET));
}

/**
 * dB値を小数点1桁にフォーマット
 */
export function formatDecibels(db: number): number {
  return Number.parseFloat(db.toFixed(1));
}

/**
 * 履歴データに新しいポイントを追加し、最大数を維持
 */
export function addHistoryPoint(
  history: HistoryDataPoint[],
  value: number,
  maxPoints: number
): HistoryDataPoint[] {
  const now = Date.now();
  const newHistory = [...history, { time: now, value }];
  return newHistory.slice(-maxPoints);
}

/**
 * デバイス名をフォーマット
 */
export function formatDeviceName(device: MediaDeviceInfo): string {
  if (device.label) {
    // MacBook の内蔵マイクの場合、シンプルな名称にする
    if (device.label.includes('Built-in') || device.label.includes('MacBook')) {
      return 'Built-in Microphone';
    }
    return device.label;
  }
  // ラベルがない場合、デバイスIDの一部を表示
  return `Microphone ${device.deviceId.slice(0, 8)}`;
}

/**
 * 音量が閾値を超えているかチェック
 */
export function isAboveThreshold(decibels: number, threshold: number): boolean {
  return decibels > threshold;
}

/**
 * プログレスバーの幅を計算（0-100%）
 */
export function calculateProgressWidth(decibels: number): number {
  return Math.min(100, (decibels / DB_RANGE.MAX) * 100);
}

