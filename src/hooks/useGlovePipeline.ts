import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { bluetoothService } from '../features/bluetooth/BluetoothService';
import { bitsToPattern } from '../features/binary/binarize';
import { gesturePipeline } from '../features/pipeline';
import { ttsService } from '../features/tts/TTSService';
import { useAppStore } from '../store/useAppStore';
import type { AppMode } from '../features/parser/types';

/** Activate the correct processor when a mode screen gains focus. */
export function useActiveMode(mode: AppMode): void {
  useFocusEffect(
    useCallback(() => {
      useAppStore.getState().setActiveMode(mode);
      gesturePipeline.setActiveMode(mode);
    }, [mode]),
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
  const fallback = gesturePipeline.getBinaryProcessor().processManualBits(liveBits);

  return {
    liveBits,
    pattern,
    label: gestureResult?.label ?? fallback.label,
    phrase: gestureResult?.phrase ?? fallback.phrase,
  };
}
