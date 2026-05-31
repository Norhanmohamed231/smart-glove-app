import React, { useEffect, useRef } from 'react';
import { bluetoothService } from '../features/bluetooth/BluetoothService';
import { gesturePipeline, gloveFrameStream } from '../features/pipeline';
import { ttsService } from '../features/tts/TTSService';
import { useAppStore } from '../store/useAppStore';

/**
 * Single app-level orchestrator: Bluetooth → Parser → Pipeline → Store → TTS.
 * Mounted once in root layout — screens only read/write store state.
 */
export function GlovePipelineProvider({ children }: { children: React.ReactNode }) {
  const inputSourceRef = useRef(useAppStore.getState().inputSource);
  const activeModeRef = useRef(useAppStore.getState().activeMode);

  useEffect(() => {
    return useAppStore.subscribe((state) => {
      inputSourceRef.current = state.inputSource;
      activeModeRef.current = state.activeMode;
    });
  }, []);

  useEffect(() => {
    gesturePipeline.setActiveMode(activeModeRef.current);

    const unsubConnection = bluetoothService.onConnectionChange((state, deviceName) => {
      useAppStore.getState().setConnectionState(state, deviceName ?? null);
    });

    const unsubFrames = gloveFrameStream.subscribe((frame) => {
      useAppStore.getState().setLatestFrame(frame);

      if (inputSourceRef.current !== 'glove') return;

      const result = gesturePipeline.processFrame(frame);
      if (result) {
        useAppStore.getState().setGestureResult(result);
      }
    });

    const unsubResults = gesturePipeline.onResult((result) => {
      useAppStore.getState().setGestureResult(result);
      if (result.isStable && result.phrase) {
        ttsService.speak(result.phrase);
      }
    });

    return () => {
      unsubConnection();
      unsubFrames();
      unsubResults();
    };
  }, []);

  return <>{children}</>;
}
