import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AppMode,
  ConnectionState,
  GestureResult,
  GloveFrame,
  InputSource,
  BluetoothDeviceInfo,
} from '../features/parser/types';
import type { AiCollectionState, ModelStatus } from '../features/ml/types';

export type HistorySource = 'AI' | 'Binary' | 'Speech';

export interface HistoryEntry {
  id: string;
  arabic: string;
  english: string;
  source: HistorySource;
  timestamp: number;
}

const HISTORY_STORAGE_KEY = '@signbridge/history';

interface AppState {
  connectionState: ConnectionState;
  connectedDeviceName: string | null;
  activeMode: AppMode;
  inputSource: InputSource;
  latestFrame: GloveFrame | null;
  gestureResult: GestureResult | null;
  manualBits: number[];
  scannedDevices: BluetoothDeviceInfo[];
  // Mock until firmware/model wiring (see plan placeholders).
  battery: number;
  confidence: number;
  modelStatus: ModelStatus;
  modelError: string | null;
  aiCollectionState: AiCollectionState;
  history: HistoryEntry[];
  setConnectionState: (state: ConnectionState, deviceName?: string | null) => void;
  setActiveMode: (mode: AppMode) => void;
  setInputSource: (source: InputSource) => void;
  setLatestFrame: (frame: GloveFrame | null) => void;
  setGestureResult: (result: GestureResult | null) => void;
  setManualBits: (bits: number[]) => void;
  toggleManualBit: (index: number) => void;
  setScannedDevices: (devices: BluetoothDeviceInfo[]) => void;
  setBattery: (battery: number) => void;
  setConfidence: (confidence: number) => void;
  setModelStatus: (status: ModelStatus, error?: string | null) => void;
  setAiCollectionState: (state: AiCollectionState) => void;
  addHistory: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  loadHistory: () => void;
}

function persistHistory(history: HistoryEntry[]) {
  AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history)).catch(() => {});
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
  battery: 78,
  confidence: 0,
  modelStatus: 'idle',
  modelError: null,
  aiCollectionState: 'idle',
  history: [],

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

  setBattery: (battery) => set({ battery }),

  setConfidence: (confidence) => set({ confidence }),

  setModelStatus: (modelStatus, modelError = null) => set({ modelStatus, modelError }),

  setAiCollectionState: (aiCollectionState) => set({ aiCollectionState }),

  addHistory: (entry) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
    };
    const history = [newEntry, ...get().history].slice(0, 200);
    set({ history });
    persistHistory(history);
  },

  clearHistory: () => {
    set({ history: [] });
    persistHistory([]);
  },

  loadHistory: () => {
    AsyncStorage.getItem(HISTORY_STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as HistoryEntry[];
        if (Array.isArray(parsed)) {
          set({ history: parsed });
        }
      })
      .catch(() => {});
  },
}));
