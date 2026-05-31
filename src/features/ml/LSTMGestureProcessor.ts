import type { GloveFrame, GestureResult } from '../parser/types';
import type { IGestureProcessor } from '../pipeline/IGestureProcessor';

const WINDOW_SIZE = 20;

export class LSTMGestureProcessor implements IGestureProcessor {
  readonly mode = 'sensor' as const;

  private buffer: GloveFrame[] = [];

  onFrame(frame: GloveFrame): GestureResult | null {
    this.buffer.push(frame);
    if (this.buffer.length > WINDOW_SIZE) {
      this.buffer.shift();
    }
    return null;
  }

  getBuffer(): GloveFrame[] {
    return [...this.buffer];
  }

  getLatestFrame(): GloveFrame | null {
    return this.buffer.length > 0 ? this.buffer[this.buffer.length - 1] : null;
  }

  reset(): void {
    this.buffer = [];
  }
}
