import type { ModelConfig, WordSignatures } from './types';
import { averageFlexValues } from './Preprocessor';

function hammingDistance(a: boolean[], b: boolean[]): number {
  return a.reduce((count, value, index) => count + (value !== b[index] ? 1 : 0), 0);
}

function flexToPattern(avgFlex: number[], thresholds: number[]): boolean[] {
  return avgFlex.map((value, index) => value < thresholds[index]);
}

export function getCandidateClasses(
  frames: Parameters<typeof averageFlexValues>[0],
  config: ModelConfig,
  signatures: WordSignatures,
): string[] {
  const livePattern = flexToPattern(averageFlexValues(frames), config.finger_thresholds);

  const exact = Object.entries(signatures)
    .filter(([, pattern]) => pattern.every((bit, index) => bit === livePattern[index]))
    .map(([word]) => word);

  if (exact.length > 0) return exact;

  const scored = Object.entries(signatures).map(([word, pattern]) => ({
    word,
    distance: hammingDistance(livePattern, pattern),
  }));
  scored.sort((a, b) => a.distance - b.distance);

  if (scored.length === 0) return [...config.classes];

  const minDistance = scored[0].distance;
  return scored.filter((item) => item.distance <= minDistance + 1).map((item) => item.word);
}

export function filterLogits(
  probs: Float32Array,
  classes: string[],
  candidates: string[],
): { label: string; confidence: number } {
  const pool = candidates.length > 0 ? candidates : classes;
  let bestLabel = pool[0];
  let bestProb = -1;

  for (let i = 0; i < classes.length; i++) {
    const label = classes[i];
    if (!pool.includes(label)) continue;
    if (probs[i] > bestProb) {
      bestProb = probs[i];
      bestLabel = label;
    }
  }

  return { label: bestLabel, confidence: Math.max(0, bestProb) };
}

export function softmax(logits: Float32Array): Float32Array {
  const max = Math.max(...logits);
  const exps = Float32Array.from(logits, (v) => Math.exp(v - max));
  const sum = exps.reduce((acc, v) => acc + v, 0);
  return Float32Array.from(exps, (v) => v / sum);
}
