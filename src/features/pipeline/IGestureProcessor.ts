import type { AppMode, GestureResult, GloveFrame } from '../parser/types';

export interface IGestureProcessor {
  readonly mode: AppMode;
  onFrame(frame: GloveFrame): GestureResult | null;
  reset(): void;
}
