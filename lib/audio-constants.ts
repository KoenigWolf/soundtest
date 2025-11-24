/**
 * オーディオ処理に関する定数定義
 */

// サンプリングレートと履歴の設定
export const SAMPLING_RATE = 60; // 1秒間に60回の更新
export const HISTORY_DURATION = 60; // 履歴の記録期間：60秒
export const MAX_HISTORY_POINTS = SAMPLING_RATE * HISTORY_DURATION; // 履歴データの最大数

// AudioContext の設定
export const AUDIO_CONFIG = {
  fftSize: 2048,
  smoothingTimeConstant: 0.8,
} as const;

// マイク設定
export const MICROPHONE_CONSTRAINTS = {
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false,
} as const;

// dB値の範囲
export const DB_RANGE = {
  MIN: 0,
  MAX: 120,
  OFFSET: 90, // RMSからdBへの変換時のオフセット
} as const;

// 波形描画の設定
export const WAVEFORM_CONFIG = {
  AMPLIFICATION: 2.5,
  HEIGHT_MULTIPLIER: 0.8,
  FREQUENCY_BAR_COUNT: 128,
  FREQUENCY_BAR_HEIGHT: 0.4,
} as const;

// グラデーションカラー（音楽アーティスト向け）
export const MUSIC_GRADIENT_COLORS = [
  { stop: 0, color: 'rgba(139, 92, 246, 0.9)' }, // Purple
  { stop: 0.25, color: 'rgba(236, 72, 153, 0.9)' }, // Pink
  { stop: 0.5, color: 'rgba(59, 130, 246, 0.9)' }, // Blue
  { stop: 0.75, color: 'rgba(34, 197, 94, 0.9)' }, // Green
  { stop: 1, color: 'rgba(251, 191, 36, 0.9)' }, // Yellow
] as const;

