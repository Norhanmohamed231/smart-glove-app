export interface DictionaryEntry {
  bits: string;
  phrase: string;
  english: string;
  isCustomized: boolean;
}

export interface DictionaryOverrideEntry {
  phrase: string;
  english?: string;
  isCustomized?: boolean;
}

export interface DictionaryOverrides {
  version: 1;
  entries: Record<string, DictionaryOverrideEntry>;
}
