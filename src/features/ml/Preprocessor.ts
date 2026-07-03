import type { ModelConfig } from './types';
import { framesToMatrix } from './frameToFeatures';
import type { GloveFrame } from '../parser/types';

function smoothColumn(values: number[], window: number): number[] {
  if (values.length === 0) return [];
  const kernel = new Array(window).fill(1 / window);
  const half = Math.floor(window / 2);
  const out = new Array(values.length).fill(0);

  for (let i = 0; i < values.length; i++) {
    let sum = 0;
    for (let k = 0; k < window; k++) {
      const idx = i - half + k;
      if (idx >= 0 && idx < values.length) {
        sum += values[idx] * kernel[k];
      }
    }
    out[i] = sum;
  }

  return out;
}

function smoothSequence(sequence: number[][], window: number): number[][] {
  if (sequence.length === 0) return [];
  const featureCount = sequence[0].length;
  const transposed: number[][] = Array.from({ length: featureCount }, () => []);

  for (const row of sequence) {
    for (let i = 0; i < featureCount; i++) {
      transposed[i].push(row[i]);
    }
  }

  const smoothed = transposed.map((col) => smoothColumn(col, window));
  const result: number[][] = Array.from({ length: sequence.length }, () => new Array(featureCount).fill(0));

  for (let f = 0; f < featureCount; f++) {
    for (let t = 0; t < sequence.length; t++) {
      result[t][f] = smoothed[f][t];
    }
  }

  return result;
}

function resampleSequence(sequence: number[][], targetLength: number): number[][] {
  if (sequence.length === 0) {
    return Array.from({ length: targetLength }, () => new Array(sequence[0]?.length ?? 0).fill(0));
  }

  const featureCount = sequence[0].length;
  const out: number[][] = Array.from({ length: targetLength }, () => new Array(featureCount).fill(0));

  if (sequence.length === 1) {
    return Array.from({ length: targetLength }, () => [...sequence[0]]);
  }

  for (let f = 0; f < featureCount; f++) {
    for (let t = 0; t < targetLength; t++) {
      const pos = (t / (targetLength - 1)) * (sequence.length - 1);
      const left = Math.floor(pos);
      const right = Math.min(sequence.length - 1, left + 1);
      const weight = pos - left;
      out[t][f] = sequence[left][f] * (1 - weight) + sequence[right][f] * weight;
    }
  }

  return out;
}

function normalize(sequence: number[][], config: ModelConfig): Float32Array {
  const { sequence_length: seqLen, input_size: inputSize, scaler_mean, scaler_scale } = config;
  const flat = new Float32Array(seqLen * inputSize);

  for (let t = 0; t < seqLen; t++) {
    for (let f = 0; f < inputSize; f++) {
      const value = sequence[t][f];
      const scale = scaler_scale[f] === 0 ? 1 : scaler_scale[f];
      flat[t * inputSize + f] = (value - scaler_mean[f]) / scale;
    }
  }

  return flat;
}

export function preprocessGestureFrames(frames: GloveFrame[], config: ModelConfig): Float32Array {
  const matrix = framesToMatrix(frames);
  const smoothWindow = config.preprocessing.smooth_window;
  const targetLength = config.preprocessing.resample_target;

  const smoothed = smoothSequence(matrix, smoothWindow);
  const resampled = resampleSequence(smoothed, targetLength);
  return normalize(resampled, config);
}

export function averageFlexValues(frames: GloveFrame[]): number[] {
  if (frames.length === 0) return [0, 0, 0, 0, 0];

  const sums = [0, 0, 0, 0, 0];
  for (const frame of frames) {
    sums[0] += frame.flex.thumb;
    sums[1] += frame.flex.index;
    sums[2] += frame.flex.middle;
    sums[3] += frame.flex.ring;
    sums[4] += frame.flex.pinky;
  }

  return sums.map((v) => v / frames.length);
}
