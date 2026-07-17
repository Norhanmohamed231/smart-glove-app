import { useCallback, useEffect, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { bluetoothService } from '../features/bluetooth/BluetoothService';
import { bitsToPattern } from '../features/binary/binarize';
import { resolveBinaryDictionaryEntry } from '../features/binary/binaryDictionaryResolver';
import { gesturePipeline } from '../features/pipeline';
import { ttsService } from '../features/tts/TTSService';
import { useAppStore } from '../store/useAppStore';
import type { AppMode } from '../features/parser/types';
import { getAiEnglish } from '../features/ml/aiLabelMap';

interface ActiveModeOptions {
  initialTranslationActive?: boolean;
}

/** Activate the correct processor when a mode screen gains focus. */
export function useActiveMode(mode: AppMode, options: ActiveModeOptions = {}): void {
  const initialTranslationActive = options.initialTranslationActive ?? true;

  useFocusEffect(
    useCallback(() => {
      useAppStore.getState().setActiveMode(mode);
      useAppStore.getState().setTranslationActive(initialTranslationActive);
      gesturePipeline.setActiveMode(mode);

      return () => {
        useAppStore.getState().setTranslationActive(false);
        useAppStore.getState().setGestureResult(null);
        gesturePipeline.reset();
      };
    }, [mode, initialTranslationActive]),
  );
}

export function useBluetoothControls() {
  const setScannedDevices = useAppStore((s) => s.setScannedDevices);

  const scan = async () => {
    const devices = await bluetoothService.scanForDevices();
    setScannedDevices(devices);
    return devices;
  };

  const connect = async (deviceId: string) => bluetoothService.connect(deviceId);

  const disconnect = async () => bluetoothService.disconnect();

  return {
    scan,
    connect,
    disconnect,
    isSupported: bluetoothService.isSupported(),
  };
}

export function useManualBinaryInput() {
  const applyManualBits = (bits: number[]) => {
    useAppStore.getState().setManualBits(bits);
    const result = gesturePipeline.processManualBits(bits);
    useAppStore.getState().setGestureResult(result);
    if (result.phrase) {
      ttsService.speak(result.phrase);
    }
  };

  const toggleManualBit = (index: number) => {
    const current = useAppStore.getState().manualBits;
    const next = [...current];
    next[index] = next[index] === 1 ? 0 : 1;
    useAppStore.getState().setInputSource('manual');
    if (!useAppStore.getState().isTranslationActive) {
      useAppStore.getState().setManualBits(next);
      useAppStore.getState().setGestureResult(null);
      return;
    }
    applyManualBits(next);
  };

  return { toggleManualBit };
}

export function useLiveBinaryBits(): number[] {
  const inputSource = useAppStore((s) => s.inputSource);
  const latestFrame = useAppStore((s) => s.latestFrame);
  const manualBits = useAppStore((s) => s.manualBits);

  if (inputSource === 'glove' && latestFrame) {
    return gesturePipeline.getBinaryProcessor().getLiveBits(latestFrame);
  }

  return manualBits;
}

export function useBinaryDisplay() {
  const gestureResult = useAppStore((s) => s.gestureResult);
  const liveBits = useLiveBinaryBits();
  const pattern = bitsToPattern(liveBits);
  const fallbackEntry = resolveBinaryDictionaryEntry(pattern);

  return {
    liveBits,
    pattern,
    label: gestureResult?.label ?? fallbackEntry.phrase,
    phrase: gestureResult?.phrase ?? fallbackEntry.phrase,
  };
}

const AI_LISTENING_LABELS = {
  idle: 'Press Start to record a gesture',
  collecting: 'Recording gesture...',
  predicting: 'Recognizing sign...',
} as const;
const AI_AUTO_RECORDING_MS = 2000;

export function useAiRecording() {
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aiCollectionState = useAppStore((s) => s.aiCollectionState);
  const modelStatus = useAppStore((s) => s.modelStatus);
  const connectionState = useAppStore((s) => s.connectionState);
  const latestFrame = useAppStore((s) => s.latestFrame);

  const isRecording = aiCollectionState === 'collecting';
  const isPredicting = aiCollectionState === 'predicting';
  const canRecord =
    modelStatus === 'ready' && connectionState === 'connected' && !isRecording && !isPredicting;
  const collectedCount = isRecording ? gesturePipeline.getLstmProcessor().getCollectedCount() : 0;

  useEffect(() => {
    return () => {
      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current);
        autoStopTimerRef.current = null;
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!canRecord) return;

    const started = gesturePipeline.startAiRecording();
    if (!started) return;

    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
    }

    autoStopTimerRef.current = setTimeout(() => {
      autoStopTimerRef.current = null;
      if (gesturePipeline.getLstmProcessor().isRecording()) {
        gesturePipeline.stopAiRecording();
      }
    }, AI_AUTO_RECORDING_MS);
  };

  return {
    isRecording,
    isPredicting,
    canRecord,
    collectedCount,
    toggleRecording,
    latestFrame,
  };
}

export function useAiDisplay() {
  const gestureResult = useAppStore((s) => s.gestureResult);
  const confidence = useAppStore((s) => s.confidence);
  const modelStatus = useAppStore((s) => s.modelStatus);
  const modelError = useAppStore((s) => s.modelError);
  const aiCollectionState = useAppStore((s) => s.aiCollectionState);
  const connectionState = useAppStore((s) => s.connectionState);

  const arabic = gestureResult?.label ?? '—';
  const english = arabic !== '—' ? getAiEnglish(arabic) : '—';
  const displayConfidence = gestureResult?.confidence ?? confidence ?? 0;

  let listeningLabel: string = AI_LISTENING_LABELS.idle;
  if (modelStatus === 'loading' || modelStatus === 'idle') {
    listeningLabel = 'AI model loading...';
  } else if (modelStatus === 'error') {
    listeningLabel = modelError ?? 'AI model failed to load';
  } else if (connectionState !== 'connected') {
    listeningLabel = 'Connect glove to start AI mode';
  } else if (aiCollectionState in AI_LISTENING_LABELS) {
    listeningLabel = AI_LISTENING_LABELS[aiCollectionState as keyof typeof AI_LISTENING_LABELS];
  }

  return {
    arabic,
    english,
    confidence: displayConfidence,
    listeningLabel,
    modelStatus,
    isReady: modelStatus === 'ready',
    isConnected: connectionState === 'connected',
    hasDetection: Boolean(gestureResult?.isStable && gestureResult.label),
  };
}
