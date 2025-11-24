/**
 * オーディオ録音機能を管理するカスタムフック
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AUDIO_CONFIG, MICROPHONE_CONSTRAINTS, MAX_HISTORY_POINTS } from '@/lib/audio-constants';
import { calculateRMS, rmsToDecibels, formatDecibels, addHistoryPoint } from '@/lib/audio-utils';
import { getErrorMessage } from '@/lib/audio-errors';
import type { HistoryDataPoint } from '@/lib/audio-types';

interface UseAudioRecordingReturn {
  isRecording: boolean;
  decibels: number;
  error: string | null;
  history: HistoryDataPoint[];
  analyser: AnalyserNode | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  cleanup: () => void;
}

export function useAudioRecording(selectedDevice: string | undefined): UseAudioRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [decibels, setDecibels] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryDataPoint[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();

  // リソースのクリーンアップ
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  // サウンドレベル更新ループ
  const updateSoundLevel = useCallback(() => {
    if (!analyserRef.current || !isRecording) return;

    const analyser = analyserRef.current;
    const dataArray = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatTimeDomainData(dataArray);

    // RMSを計算してdB値に変換
    const rms = calculateRMS(dataArray);
    const normalizedDb = rmsToDecibels(rms);
    const formattedDb = formatDecibels(normalizedDb);

    setDecibels(formattedDb);
    setHistory(prev => addHistoryPoint(prev, normalizedDb, MAX_HISTORY_POINTS));

    // 次のフレームで再度実行
    animationFrameRef.current = requestAnimationFrame(updateSoundLevel);
  }, [isRecording]);

  // 録音開始
  const startRecording = useCallback(async () => {
    try {
      cleanup();
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          ...MICROPHONE_CONSTRAINTS,
        },
      });

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = AUDIO_CONFIG.fftSize;
      analyser.smoothingTimeConstant = AUDIO_CONFIG.smoothingTimeConstant;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // 参照を保存
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      streamRef.current = stream;

      setIsRecording(true);
      requestAnimationFrame(updateSoundLevel);
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'RECORDING_FAILED');
      setError(errorMessage);
      console.error('Recording start error:', err);
    }
  }, [selectedDevice, cleanup, updateSoundLevel]);

  // 録音停止
  const stopRecording = useCallback(() => {
    setIsRecording(false);
    cleanup();
  }, [cleanup]);

  // コンポーネントのアンマウント時にクリーンアップ
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isRecording,
    decibels,
    error,
    history,
    analyser: analyserRef.current,
    startRecording,
    stopRecording,
    cleanup,
  };
}

