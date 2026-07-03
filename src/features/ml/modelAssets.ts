import preprocessorsJson from '@/assets/models/preprocessors.json';
import wordSignaturesJson from '@/assets/models/word_signatures.json';
import type { ModelConfig, WordSignatures } from './types';

export const modelConfig = preprocessorsJson as ModelConfig;
export const wordSignatures = wordSignaturesJson as WordSignatures;

export function getModelConfig(): ModelConfig {
  return modelConfig;
}

export function getWordSignatures(): WordSignatures {
  return wordSignatures;
}
