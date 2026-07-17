import { getDefaultEntry } from './BinaryDictionaryStore';
import type { DictionaryEntry } from './types';

type DictionaryEntryResolver = (bits: string) => DictionaryEntry;

let resolveEntry: DictionaryEntryResolver = getDefaultEntry;

export function setBinaryDictionaryResolver(resolver: DictionaryEntryResolver): void {
  resolveEntry = resolver;
}

export function resolveBinaryDictionaryEntry(bits: string): DictionaryEntry {
  return resolveEntry(bits);
}

export function resetBinaryDictionaryResolver(): void {
  resolveEntry = getDefaultEntry;
}
