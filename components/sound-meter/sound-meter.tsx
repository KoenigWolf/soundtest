'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WaveformVisualizer } from './waveform-visualizer';
import { HistoryGraph } from './history-graph';
import { DeviceSelector } from './device-selector';
import { ThresholdSettings } from './threshold-settings';
import { cn } from '@/lib/utils';

// サンプリングレートと履歴の設定
const SAMPLING_RATE = 60; // 1秒間に60回の更新
const HISTORY_DURATION = 60; // 履歴の記録期間：60秒
const MAX_HISTORY_POINTS = SAMPLING_RATE * HISTORY_DURATION; // 履歴データの最大数

// SoundMeter コンポーネント：マイク入力の音量計測とUI表示を行う
export function SoundMeter() {
  // State 定義
  const [isRecording, setIsRecording] = useState(false); // 録音中か否か
  const [decibels, setDecibels] = useState(0); // 現在のdB値
  const [error, setError] = useState<string | null>(null); // エラー情報
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]); // 利用可能な音声入力デバイス一覧
  const [selectedDevice, setSelectedDevice] = useState<string | undefined>(undefined); // 選択中のデバイスID
  const [threshold, setThreshold] = useState(75); // 警告閾値（dB）
  const [history, setHistory] = useState<{ time: number; value: number }[]>([]); // 音量履歴データ
  const [colorMode, setColorMode] = useState<'default' | 'gradient'>('gradient'); // 波形表示のカラーモード

  // AudioContext や各種ノードの参照
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();

  // 初期化：デバイスのセットアップとマイク許可の取得
  useEffect(() => {
    async function setupDevices() {
      try {
        // 最初にマイクアクセスを要求してラベル付きデバイス情報を取得
        const initialStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = mediaDevices.filter(d => d.kind === 'audioinput');
        setDevices(audioDevices);

        // 利用可能なデバイスがあれば、最初のデバイスを選択
        if (audioDevices.length > 0) {
          setSelectedDevice(audioDevices[0].deviceId);
        }

        // 初期ストリームのトラックを停止
        for (const track of initialStream.getTracks()) {
          track.stop();
        }
      } catch (err) {
        setError('Failed to enumerate audio devices');
        console.error(err);
      }
    }

    setupDevices();
    return () => cleanup();
  }, []);

  // cleanup 関数：録音停止時にリソースを解放する
  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  // 録音開始：マイクからのストリーム取得と AudioContext の初期化
  const startRecording = async () => {
    try {
      cleanup();
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        }
      });

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      // Analyser の設定
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);

      // 各種参照にセット
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      streamRef.current = stream;

      setIsRecording(true);
      // サウンドレベル更新ループの開始
      requestAnimationFrame(updateSoundLevel);
    } catch (err) {
      setError('Failed to access microphone. Please ensure you have granted permission.');
      console.error(err);
    }
  };

  // 録音停止：状態更新とリソースのクリーンアップ
  const stopRecording = () => {
    setIsRecording(false);
    cleanup();
  };

  // サウンドレベル更新：AudioContext からのデータでdB値と履歴を更新
  const updateSoundLevel = () => {
    if (!analyserRef.current || !isRecording) return;

    const analyser = analyserRef.current;
    const dataArray = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatTimeDomainData(dataArray);

    // RMS（平方根平均二乗）の計算
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);

    // RMS を dB に変換
    const db = 20 * Math.log10(Math.max(rms, 1e-6));
    // dB値を 0～120 の範囲に正規化
    const normalizedDb = Math.max(0, Math.min(120, db + 90));

    // 小数点1桁にして状態更新
    setDecibels(Number.parseFloat(normalizedDb.toFixed(1)));

    // 履歴データを更新
    setHistory(prev => {
      const now = Date.now();
      const newHistory = [...prev, { time: now, value: normalizedDb }];
      // 履歴の最大ポイント数を維持
      return newHistory.slice(-MAX_HISTORY_POINTS);
    });

    // 次のフレームで再度実行
    animationFrameRef.current = requestAnimationFrame(updateSoundLevel);
  };

  // 現在の音量が閾値を超えているか
  const isAboveThreshold = decibels > threshold;

  return (
    <div className="w-full max-w-3xl space-y-6">
      {/* エラー表示 */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* サウンドメーター本体 */}
      <Card className="p-6">
        <div className="flex flex-col items-center space-y-6">
          {/* マイクデバイスの選択 */}
          {devices.length > 0 && selectedDevice && (
            <DeviceSelector
              devices={devices}
              selectedDevice={selectedDevice}
              onDeviceChange={setSelectedDevice}
              disabled={isRecording}
            />
          )}

          {/* 波形ビジュアライザー */}
          <WaveformVisualizer
            analyser={analyserRef.current}
            isRecording={isRecording}
            colorMode={colorMode}
          />

          {/* 録音開始／停止ボタン */}
          <Button
            size="lg"
            onClick={isRecording ? stopRecording : startRecording}
            className="w-full max-w-sm"
          >
            {isRecording ? (
              <>
                <MicOff className="mr-2 h-5 w-5" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="mr-2 h-5 w-5" />
                Start Recording
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* 閾値設定と履歴グラフ表示 */}
      <div className="grid gap-6 md:grid-cols-2">
        <ThresholdSettings
          threshold={threshold}
          onThresholdChange={setThreshold}
        />

        <Card className="p-6">
          <HistoryGraph data={history} threshold={threshold} />
        </Card>
      </div>
    </div>
  );
}
