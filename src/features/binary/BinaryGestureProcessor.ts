import type { GloveFrame, GestureResult } from '../parser/types';
import { bitsToPattern, flexToBits } from './binarize';
import { DEBOUNCE_MS } from './constants';
import { lookupWord } from './defaultDictionary';
import type { IGestureProcessor } from '../pipeline/IGestureProcessor';

export class BinaryGestureProcessor implements IGestureProcessor {  readonly mode = 'binary' as const;

  private stablePattern: string | null = null;
  private pendingPattern: string | null = null;
  private pendingSince = 0;
  private lastEmittedPattern: string | null = null;

  onFrame(frame: GloveFrame): GestureResult | null {
    const bits = flexToBits(frame.flex);
    const pattern = bitsToPattern(bits);
    const now = Date.now();

    if (pattern !== this.pendingPattern) {
      this.pendingPattern = pattern;
      this.pendingSince = now;
    }

    const isStable = this.pendingPattern !== null && now - this.pendingSince >= DEBOUNCE_MS;

    if (isStable && this.pendingPattern !== this.stablePattern) {
      this.stablePattern = this.pendingPattern;
    }

    const label = lookupWord(pattern);
    const phrase = label;

    const result: GestureResult = {
      mode: 'binary',
      label,
      bits: pattern,
      phrase,
      isStable: isStable && pattern === this.stablePattern,
    };

    if (result.isStable && pattern !== this.lastEmittedPattern) {
      this.lastEmittedPattern = pattern;
      return result;
    }

    return {
      ...result,
      isStable: false,
    };
  }

  processManualBits(bits: number[]): GestureResult {
    const pattern = bitsToPattern(bits);
    const label = lookupWord(pattern);
    return {
      mode: 'binary',
      label,
      bits: pattern,
      phrase: label,
      isStable: true,
    };
  }

  getLiveBits(frame: GloveFrame): number[] {
    return flexToBits(frame.flex);
  }

  reset(): void {
    this.stablePattern = null;
    this.pendingPattern = null;
    this.pendingSince = 0;
    this.lastEmittedPattern = null;
  }
}
