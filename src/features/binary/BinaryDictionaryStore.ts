import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_DICTIONARY,
  EN_DICTIONARY,
  EN_UNKNOWN,
  lookupEnglish,
  UNKNOWN_PATTERN,
} from './defaultDictionary';
import { BINARY_PATTERN_BITS } from './gestureIllustrations';
import type { DictionaryEntry, DictionaryOverrideEntry, DictionaryOverrides } from './types';

export const DICTIONARY_STORAGE_KEY = '@signtalker/binary-dictionary';

const PHRASE_MAX_LENGTH = 120;
const ENGLISH_MAX_LENGTH = 120;

export function getDefaultEntry(bits: string): DictionaryEntry {
  const phrase = DEFAULT_DICTIONARY[bits] ?? UNKNOWN_PATTERN;
  return {
    bits,
    phrase,
    english: EN_DICTIONARY[bits] ?? EN_UNKNOWN,
    isCustomized: false,
  };
}

export function getEffectiveDictionary(
  overrides: DictionaryOverrides | null,
): Record<string, DictionaryEntry> {
  const dictionary: Record<string, DictionaryEntry> = {};

  for (const bits of BINARY_PATTERN_BITS) {
    const override = overrides?.entries[bits];
    if (override?.phrase) {
      dictionary[bits] = {
        bits,
        phrase: override.phrase,
        english: override.english?.trim() || lookupEnglish(bits),
        isCustomized: override.isCustomized ?? true,
      };
    } else {
      dictionary[bits] = getDefaultEntry(bits);
    }
  }

  return dictionary;
}

export function resolveEnglishForEntry(entry: DictionaryEntry): string {
  if (entry.isCustomized && entry.english) {
    return entry.english;
  }
  if (!entry.isCustomized) {
    return lookupEnglish(entry.bits);
  }
  return entry.english || EN_UNKNOWN;
}

export function validateDictionaryInput(
  phrase: string,
  english?: string,
): { phrase: string; english?: string } | null {
  const trimmedPhrase = phrase.trim();
  const trimmedEnglish = english?.trim();

  if (!trimmedPhrase || trimmedPhrase.length > PHRASE_MAX_LENGTH) {
    return null;
  }

  if (trimmedEnglish && trimmedEnglish.length > ENGLISH_MAX_LENGTH) {
    return null;
  }

  return {
    phrase: trimmedPhrase,
    english: trimmedEnglish || undefined,
  };
}

export class BinaryDictionaryStore {
  static async load(): Promise<DictionaryOverrides | null> {
    try {
      const raw = await AsyncStorage.getItem(DICTIONARY_STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as DictionaryOverrides;
      if (parsed?.version !== 1 || typeof parsed.entries !== 'object') {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }

  static async persist(overrides: DictionaryOverrides | null): Promise<void> {
    if (!overrides || Object.keys(overrides.entries).length === 0) {
      await AsyncStorage.removeItem(DICTIONARY_STORAGE_KEY);
      return;
    }

    await AsyncStorage.setItem(DICTIONARY_STORAGE_KEY, JSON.stringify(overrides));
  }

  static buildOverridesFromEntries(entries: Record<string, DictionaryOverrideEntry>): DictionaryOverrides {
    return { version: 1, entries };
  }

  static extractOverrides(
    dictionary: Record<string, DictionaryEntry>,
  ): DictionaryOverrides | null {
    const entries: Record<string, DictionaryOverrideEntry> = {};

    for (const bits of BINARY_PATTERN_BITS) {
      const entry = dictionary[bits];
      if (entry?.isCustomized) {
        entries[bits] = {
          phrase: entry.phrase,
          english: entry.english,
          isCustomized: true,
        };
      }
    }

    if (Object.keys(entries).length === 0) {
      return null;
    }

    return { version: 1, entries };
  }

  static applyEntryOverride(
    overrides: DictionaryOverrides | null,
    bits: string,
    phrase: string,
    english?: string,
  ): DictionaryOverrides {
    const defaultEntry = getDefaultEntry(bits);
    const entries = { ...(overrides?.entries ?? {}) };

    if (phrase === defaultEntry.phrase && (english ?? defaultEntry.english) === defaultEntry.english) {
      delete entries[bits];
    } else {
      entries[bits] = {
        phrase,
        english: english ?? defaultEntry.english,
        isCustomized: true,
      };
    }

    return { version: 1, entries };
  }

  static removeEntryOverride(
    overrides: DictionaryOverrides | null,
    bits: string,
  ): DictionaryOverrides | null {
    if (!overrides) return null;

    const entries = { ...overrides.entries };
    delete entries[bits];

    if (Object.keys(entries).length === 0) {
      return null;
    }

    return { version: 1, entries };
  }

  static clearAll(): null {
    return null;
  }
}
