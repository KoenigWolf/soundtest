'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WaveformVisualizer } from './waveform-visualizer';
import { HistoryGraph } from './history-graph';
import { DeviceSelector } from './device-selector';
import { ThresholdSettings } from './threshold-settings';
import { useAudioRecording } from '@/hooks/use-audio-recording';
import { useAudioDevices } from '@/hooks/use-audio-devices';
import { isAboveThreshold, calculateProgressWidth } from '@/lib/audio-utils';
import type { ColorMode } from '@/lib/audio-types';

const DEFAULT_THRESHOLD = 75;
const DEFAULT_COLOR_MODE: ColorMode = 'gradient';

/**
 * SoundMeter コンポーネント：マイク入力の音量計測とUI表示を行う
 */
export function SoundMeter() {
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);
  const [colorMode] = useState<ColorMode>(DEFAULT_COLOR_MODE);

  // オーディオデバイス管理
  const { devices, selectedDevice, setSelectedDevice, error: deviceError } = useAudioDevices();

  // オーディオ録音管理
  const {
    isRecording,
    decibels,
    error: recordingError,
    history,
    analyser,
    startRecording,
    stopRecording,
  } = useAudioRecording(selectedDevice);

  // エラー状態の統合
  const error = deviceError || recordingError;

  // 閾値超過チェック（メモ化）
  const aboveThreshold = useMemo(
    () => isAboveThreshold(decibels, threshold),
    [decibels, threshold]
  );

  // プログレスバーの幅（メモ化）
  const progressWidth = useMemo(
    () => calculateProgressWidth(decibels),
    [decibels]
  );

  // パーティクル効果の設定（メモ化）
  const particles = useMemo(
    () => Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: 10 + i * 10,
      delay: i * 0.3,
      duration: 1.5 + i * 0.2,
    })),
    []
  );

  return (
    <div className="w-full space-y-6 sm:space-y-8 lg:space-y-10">
      {/* エラー表示 */}
      {error && (
        <Alert variant="destructive" className="border-2 shadow-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 閾値超過警告 */}
      {aboveThreshold && isRecording && (
        <Alert variant="destructive" className="border-2 shadow-lg animate-pulse">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Sound level ({decibels.toFixed(1)} dB) exceeds threshold ({threshold} dB)
          </AlertDescription>
        </Alert>
      )}

      {/* メイン波形表示エリア - アップグレード版 */}
      <Card className="p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-purple-900/10 via-indigo-900/10 to-pink-900/10 border-2 border-purple-500/20 shadow-2xl backdrop-blur-xl relative overflow-hidden animate-hologram">
        {/* 極彩色のオーロラ効果 */}
        <div className="absolute inset-0 animate-aurora-glow rounded-2xl" />

        {/* 音楽的なパーティクル効果 */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1 h-8 bg-gradient-to-t from-transparent via-purple-400 to-transparent animate-sound-wave opacity-60"
              style={{
                left: `${particle.left}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            />
          ))}
        </div>

        <div className="flex flex-col items-center space-y-8 sm:space-y-10 lg:space-y-12 relative z-10">
          {/* 音量レベル表示 - 極彩色バージョン */}
          <div className="w-full text-center space-y-4 sm:space-y-6">
            {/* 音楽的なヘッダー */}
            <div className="relative">
              <div className="text-sm sm:text-base font-bold text-purple-300/90 dark:text-purple-200/90 uppercase tracking-widest animate-cosmic-float">
                🎵 Ultimate Sound Level 🎵
              </div>
              {/* 装飾的なライン */}
              <div className="absolute -top-2 -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-60" />
            </div>

            {/* メイン数字表示 */}
            <div className="flex items-baseline justify-center gap-3 sm:gap-4">
              <span
                className={`text-6xl sm:text-7xl lg:text-8xl font-black tabular-nums transition-all duration-500 ${
                  aboveThreshold && isRecording
                    ? 'text-red-400 drop-shadow-[0_0_30px_rgba(248,113,113,0.8)] animate-pulse-slow'
                    : 'bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(139,92,246,0.6)]'
                }`}
                style={{
                  animation: isRecording && !aboveThreshold ? 'musicPulse 3s ease-in-out infinite' : 'none',
                  textShadow: isRecording ? '0 0 20px currentColor' : 'none',
                }}
              >
                {decibels.toFixed(1)}
              </span>
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-300/80 dark:text-purple-200/80 tracking-wide">dB</span>
            </div>

            {/* 極彩色プログレスバー */}
            <div className="relative w-full max-w-xl mx-auto">
              <div className="h-4 sm:h-5 bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-pink-900/40 rounded-full overflow-hidden shadow-inner border border-purple-500/30 backdrop-blur-sm">
                <div
                  className={`h-full transition-all duration-300 rounded-full shadow-2xl ${
                    aboveThreshold && isRecording
                      ? 'bg-gradient-to-r from-red-500 via-red-400 to-red-600 animate-pulse-slow'
                      : 'bg-gradient-to-r from-purple-500 via-pink-500 via-cyan-500 to-indigo-500'
                  }`}
                  style={{
                    width: `${progressWidth}%`,
                    boxShadow: isRecording
                      ? '0 0 30px rgba(139, 92, 246, 0.8), 0 0 60px rgba(236, 72, 153, 0.6), 0 0 90px rgba(59, 130, 246, 0.4)'
                      : '0 0 15px rgba(139, 92, 246, 0.4)',
                  }}
                />
              </div>
              {/* 装飾的なオーバーレイ */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-gradient" />
            </div>

            {/* ステータスインジケーター */}
            <div className="flex items-center justify-center gap-4 text-sm font-medium">
              <div className={`px-3 py-1 rounded-full backdrop-blur-sm border transition-all duration-300 ${
                isRecording
                  ? 'bg-green-500/20 text-green-300 border-green-500/30 animate-pulse'
                  : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
              }`}>
                {isRecording ? '🔴 LIVE RECORDING' : '⚫ STANDBY'}
              </div>
            </div>
          </div>

          {/* 波形ビジュアライザー */}
          <div className="w-full">
            <WaveformVisualizer
              analyser={analyser}
              isRecording={isRecording}
              colorMode={colorMode}
            />
          </div>

          {/* コントロールエリア */}
          <div className="w-full max-w-2xl space-y-5 sm:space-y-6">
            {/* マイクデバイスの選択 */}
            {devices.length > 0 && selectedDevice && (
              <div className="flex justify-center">
                <DeviceSelector
                  devices={devices}
                  selectedDevice={selectedDevice}
                  onDeviceChange={setSelectedDevice}
                  disabled={isRecording}
                />
              </div>
            )}

            {/* 極彩色コントロールボタン */}
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={isRecording ? stopRecording : startRecording}
                className={`
                  min-w-[240px] sm:min-w-[280px] h-14 sm:h-16 text-lg sm:text-xl font-bold
                  ${isRecording
                    ? 'bg-gradient-to-r from-red-600 via-red-500 to-red-700 hover:from-red-700 hover:via-red-600 hover:to-red-800 text-white shadow-2xl shadow-red-500/60 animate-pulse-slow'
                    : 'bg-gradient-to-r from-purple-600 via-pink-600 via-cyan-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:via-cyan-700 hover:to-indigo-700 text-white shadow-2xl shadow-purple-500/60'
                  }
                  transition-all duration-500 rounded-2xl border-2
                  ${isRecording ? 'border-red-400/50' : 'border-purple-400/50'}
                  hover:scale-110 active:scale-95
                  backdrop-blur-sm
                `}
                style={{
                  boxShadow: isRecording
                    ? '0 0 40px rgba(239, 68, 68, 0.6), 0 0 80px rgba(239, 68, 68, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.2)'
                    : '0 0 40px rgba(139, 92, 246, 0.6), 0 0 80px rgba(236, 72, 153, 0.4), 0 0 120px rgba(59, 130, 246, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.1)',
                }}
              >
                {isRecording ? (
                  <>
                    <MicOff className="mr-3 h-6 w-6" />
                    🔴 STOP SESSION
                  </>
                ) : (
                  <>
                    <Mic className="mr-3 h-6 w-6" />
                    🎵 START RECORDING
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* 閾値設定と履歴グラフ表示 */}
      <div className="grid gap-6 sm:gap-8 lg:gap-10 md:grid-cols-2">
        <ThresholdSettings
          threshold={threshold}
          onThresholdChange={setThreshold}
        />

        <Card className="p-6 sm:p-8 border-2 border-purple-500/30 shadow-xl flex flex-col h-full min-h-[300px] sm:min-h-[350px] bg-gradient-to-br from-purple-900/20 via-indigo-900/20 to-pink-900/20 backdrop-blur-sm">
          <HistoryGraph data={history} threshold={threshold} />
        </Card>
      </div>
    </div>
  );
}
