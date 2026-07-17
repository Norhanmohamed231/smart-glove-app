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
import {
  BinaryDictionaryStore,
  getEffectiveDictionary,
  validateDictionaryInput,
} from '../features/binary/BinaryDictionaryStore';
import { setBinaryDictionaryResolver } from '../features/binary/binaryDictionaryResolver';
import type { DictionaryEntry, DictionaryOverrides } from '../features/binary/types';

export type HistorySource = 'AI' | 'Binary' | 'Speech';

export interface HistoryEntry {
  id: string;
  arabic: string;
  english: string;
  source: HistorySource;
  timestamp: number;
}

const HISTORY_STORAGE_KEY = '@signtalker/history';

interface AppState {
  connectionState: ConnectionState;
  connectedDeviceName: string | null;
  activeMode: AppMode;
  inputSource: InputSource;
  isTranslationActive: boolean;
  latestFrame: GloveFrame | null;
  gestureResult: GestureResult | null;
  manualBits: number[];
  scannedDevices: BluetoothDeviceInfo[];
  battery: number;
  confidence: number;
  modelStatus: ModelStatus;
  modelError: string | null;
  aiCollectionState: AiCollectionState;
  history: HistoryEntry[];
  binaryDictionary: Record<string, DictionaryEntry>;
  dictionaryOverrides: DictionaryOverrides | null;
  setConnectionState: (state: ConnectionState, deviceName?: string | null) => void;
  setActiveMode: (mode: AppMode) => void;
  setInputSource: (source: InputSource) => void;
  setTranslationActive: (active: boolean) => void;
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
  loadBinaryDictionary: () => Promise<void>;
  getDictionaryEntry: (bits: string) => DictionaryEntry;
  saveDictionaryEntry: (bits: string, phrase: string, english?: string) => Promise<boolean>;
  resetDictionaryEntry: (bits: string) => Promise<void>;
  resetAllDictionary: () => Promise<void>;
  syncBinaryDictionaryResolver: () => void;
}

function persistHistory(history: HistoryEntry[]) {
  AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history)).catch(() => {});
}

function applyDictionaryState(
  set: (partial: Partial<AppState>) => void,
  get: () => AppState,
  overrides: DictionaryOverrides | null,
) {
  const binaryDictionary = getEffectiveDictionary(overrides);
  set({ dictionaryOverrides: overrides, binaryDictionary });
  get().syncBinaryDictionaryResolver();
}

export const useAppStore = create<AppState>((set, get) => ({
  connectionState: 'disconnected',
  connectedDeviceName: null,
  activeMode: 'binary',
  inputSource: 'glove',
  isTranslationActive: false,
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
  binaryDictionary: getEffectiveDictionary(null),
  dictionaryOverrides: null,

  setConnectionState: (connectionState, deviceName = null) =>
    set({ connectionState, connectedDeviceName: deviceName ?? null }),

  setActiveMode: (activeMode) => set({ activeMode }),

  setInputSource: (inputSource) => set({ inputSource }),

  setTranslationActive: (isTranslationActive) => set({ isTranslationActive }),

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

  syncBinaryDictionaryResolver: () => {
    setBinaryDictionaryResolver((bits) => get().getDictionaryEntry(bits));
  },

  getDictionaryEntry: (bits) => {
    return get().binaryDictionary[bits] ?? getEffectiveDictionary(null)[bits];
  },

  loadBinaryDictionary: async () => {
    const overrides = await BinaryDictionaryStore.load();
    applyDictionaryState(set, get, overrides);
  },

  saveDictionaryEntry: async (bits, phrase, english) => {
    const input = validateDictionaryInput(phrase, english);
    if (!input) return false;

    const overrides = BinaryDictionaryStore.applyEntryOverride(
      get().dictionaryOverrides,
      bits,
      input.phrase,
      input.english,
    );

    const nextOverrides = Object.keys(overrides.entries).length === 0 ? null : overrides;
    await BinaryDictionaryStore.persist(nextOverrides);
    applyDictionaryState(set, get, nextOverrides);
    return true;
  },

  resetDictionaryEntry: async (bits) => {
    const overrides = BinaryDictionaryStore.removeEntryOverride(get().dictionaryOverrides, bits);
    await BinaryDictionaryStore.persist(overrides);
    applyDictionaryState(set, get, overrides);
  },

  resetAllDictionary: async () => {
    await BinaryDictionaryStore.persist(null);
    applyDictionaryState(set, get, null);
  },
}));

useAppStore.getState().syncBinaryDictionaryResolver();
