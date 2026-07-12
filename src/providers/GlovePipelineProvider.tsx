import React, { useEffect, useRef } from 'react';
import { bluetoothService } from '../features/bluetooth/BluetoothService';
import { gesturePipeline, gloveFrameStream } from '../features/pipeline';
import { ttsService } from '../features/tts/TTSService';
import { useAppStore } from '../store/useAppStore';
import { translateArabic, UNKNOWN_PATTERN } from '../features/binary/defaultDictionary';
import { lstmInferenceEngine } from '../features/ml/LSTMInferenceEngine';
import { AI_UNKNOWN_AR, getAiEnglish } from '../features/ml/aiLabelMap';

/**
 * Single app-level orchestrator: Bluetooth → Parser → Pipeline → Store → TTS.
 * Mounted once in root layout — screens only read/write store state.
 */
export function GlovePipelineProvider({ children }: { children: React.ReactNode }) {
  const inputSourceRef = useRef(useAppStore.getState().inputSource);
  const activeModeRef = useRef(useAppStore.getState().activeMode);
  const isTranslationActiveRef = useRef(useAppStore.getState().isTranslationActive);

  useEffect(() => {
    return useAppStore.subscribe((state) => {
      inputSourceRef.current = state.inputSource;
      activeModeRef.current = state.activeMode;
      isTranslationActiveRef.current = state.isTranslationActive;
    });
  }, []);

  useEffect(() => {
    useAppStore.getState().loadHistory();
  }, []);

  useEffect(() => {
    useAppStore.getState().setModelStatus('loading');

    lstmInferenceEngine
      .load()
      .then(() => useAppStore.getState().setModelStatus('ready'))
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Model load failed';
        console.warn('[signTalker] ONNX model load failed:', message);
        useAppStore.getState().setModelStatus('error', message);
      });
  }, []);

  useEffect(() => {
    gesturePipeline.setActiveMode(activeModeRef.current);

    const unsubLstmState = gesturePipeline.getLstmProcessor().onStateChange((state) => {
      useAppStore.getState().setAiCollectionState(state);
    });

    const unsubConnection = bluetoothService.onConnectionChange((state, deviceName) => {
      useAppStore.getState().setConnectionState(state, deviceName ?? null);
    });

    const unsubFrames = gloveFrameStream.subscribe((frame) => {
      useAppStore.getState().setLatestFrame(frame);

      if (!isTranslationActiveRef.current) return;
      if (inputSourceRef.current !== 'glove') return;
      if (activeModeRef.current === 'sensor' && !lstmInferenceEngine.isReady()) return;

      const result = gesturePipeline.processFrame(frame);
      if (result) {
        useAppStore.getState().setGestureResult(result);
      }
    });

    const unsubResults = gesturePipeline.onResult((result) => {
      if (!isTranslationActiveRef.current) return;
      if (result.mode !== activeModeRef.current) return;

      useAppStore.getState().setGestureResult(result);
      if (result.confidence != null) {
        useAppStore.getState().setConfidence(result.confidence);
      }
      if (result.isStable && result.phrase) {
        ttsService.speak(result.phrase);
      }

      const isAiUnknown = result.mode === 'sensor' && result.label === AI_UNKNOWN_AR;
      const isBinaryUnknown = result.mode === 'binary' && result.label === UNKNOWN_PATTERN;

      if (result.isStable && result.label && !isAiUnknown && !isBinaryUnknown) {
        const english =
          result.mode === 'sensor' ? getAiEnglish(result.label) : translateArabic(result.label);

        useAppStore.getState().addHistory({
          arabic: result.label,
          english,
          source: result.mode === 'binary' ? 'Binary' : 'AI',
        });
      }
    });

    return () => {
      unsubLstmState();
      unsubConnection();
      unsubFrames();
      unsubResults();
    };
  }, []);

  return <>{children}</>;
}
