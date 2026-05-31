import { create } from 'zustand';
import type {
  AppMode,
  ConnectionState,
  GestureResult,
  GloveFrame,
  InputSource,
  BluetoothDeviceInfo,
} from '../features/parser/types';

interface AppState {
  connectionState: ConnectionState;
  connectedDeviceName: string | null;
  activeMode: AppMode;
  inputSource: InputSource;
  latestFrame: GloveFrame | null;
  gestureResult: GestureResult | null;
  manualBits: number[];
  scannedDevices: BluetoothDeviceInfo[];
  setConnectionState: (state: ConnectionState, deviceName?: string | null) => void;
  setActiveMode: (mode: AppMode) => void;
  setInputSource: (source: InputSource) => void;
  setLatestFrame: (frame: GloveFrame | null) => void;
  setGestureResult: (result: GestureResult | null) => void;
  setManualBits: (bits: number[]) => void;
  toggleManualBit: (index: number) => void;
  setScannedDevices: (devices: BluetoothDeviceInfo[]) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  connectionState: 'disconnected',
  connectedDeviceName: null,
  activeMode: 'binary',
  inputSource: 'glove',
  latestFrame: null,
  gestureResult: null,
  manualBits: [0, 0, 0, 0, 0],
  scannedDevices: [],

  setConnectionState: (connectionState, deviceName = null) =>
    set({ connectionState, connectedDeviceName: deviceName ?? null }),

  setActiveMode: (activeMode) => set({ activeMode }),

  setInputSource: (inputSource) => set({ inputSource }),

  setLatestFrame: (latestFrame) => set({ latestFrame }),

  setGestureResult: (gestureResult) => set({ gestureResult }),

  setManualBits: (manualBits) => set({ manualBits }),

  toggleManualBit: (index) => {
    const bits = [...get().manualBits];
    bits[index] = bits[index] === 1 ? 0 : 1;
    set({ manualBits: bits, inputSource: 'manual' });
  },

  setScannedDevices: (scannedDevices) => set({ scannedDevices }),
}));
