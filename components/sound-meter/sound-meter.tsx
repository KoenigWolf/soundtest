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

const SAMPLING_RATE = 60; // Hz
const HISTORY_DURATION = 60; // seconds
const MAX_HISTORY_POINTS = SAMPLING_RATE * HISTORY_DURATION;

export function SoundMeter() {
  const [isRecording, setIsRecording] = useState(false);
  const [decibels, setDecibels] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | undefined>(undefined);
  const [threshold, setThreshold] = useState(75); // dB
  const [history, setHistory] = useState<{ time: number; value: number }[]>([]);
  const [colorMode, setColorMode] = useState<'default' | 'gradient'>('gradient');

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    // Request microphone permission first to get full device information
    async function setupDevices() {
      try {
        // Request permission first to get labeled devices
        const initialStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Get the devices after permission is granted
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = mediaDevices.filter(d => d.kind === 'audioinput');
        setDevices(audioDevices);
        
        if (audioDevices.length > 0) {
          setSelectedDevice(audioDevices[0].deviceId);
        }
        
        // Stop the initial stream
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

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    if (streamRef.current) {
      // Use for...of instead of forEach
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

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

      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      streamRef.current = stream;

      setIsRecording(true);
      requestAnimationFrame(updateSoundLevel);
    } catch (err) {
      setError('Failed to access microphone. Please ensure you have granted permission.');
      console.error(err);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    cleanup();
  };

  const updateSoundLevel = () => {
    if (!analyserRef.current || !isRecording) return;

    const analyser = analyserRef.current;
    const dataArray = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatTimeDomainData(dataArray);

    // Calculate RMS value
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);
    
    // Convert to dB
    const db = 20 * Math.log10(Math.max(rms, 1e-6));
    const normalizedDb = Math.max(0, Math.min(120, db + 90)); // Normalize to 0-120 dB range
    
    setDecibels(Number.parseFloat(normalizedDb.toFixed(1)));
    
    // Update history
    setHistory(prev => {
      const now = Date.now();
      const newHistory = [...prev, { time: now, value: normalizedDb }];
      return newHistory.slice(-MAX_HISTORY_POINTS);
    });

    animationFrameRef.current = requestAnimationFrame(updateSoundLevel);
  };

  const isAboveThreshold = decibels > threshold;

  return (
    <div className="w-full max-w-3xl space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <div className="flex flex-col items-center space-y-6">
          {devices.length > 0 && selectedDevice && (
            <DeviceSelector
              devices={devices}
              selectedDevice={selectedDevice}
              onDeviceChange={setSelectedDevice}
              disabled={isRecording}
            />
          )}

          <div className="text-center">
            <div className={cn(
              "text-6xl font-bold transition-colors",
              isAboveThreshold ? "text-destructive" : "text-primary"
            )}>
              {decibels.toFixed(1)} dB
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Sound Level
            </p>
          </div>

          <WaveformVisualizer
            analyser={analyserRef.current}
            isRecording={isRecording}
            colorMode={colorMode}
          />

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