import type { GloveFrame } from '../parser/types';
import type { AiCollectionState } from './types';

const MIN_FRAMES = 5;

export class GestureCollector {
  private state: AiCollectionState = 'idle';
  private collectedFrames: GloveFrame[] = [];

  reset(): void {
    this.state = 'idle';
    this.collectedFrames = [];
  }

  getState(): AiCollectionState {
    return this.state;
  }

  getCollectedCount(): number {
    return this.collectedFrames.length;
  }

  start(): boolean {
    if (this.state !== 'idle') return false;
    this.state = 'collecting';
    this.collectedFrames = [];
    return true;
  }

  /** Stop recording and return frames when enough samples were captured. */
  stop(): GloveFrame[] | null {
    if (this.state !== 'collecting') return null;

    const frames = [...this.collectedFrames];
    this.collectedFrames = [];
    this.state = 'idle';

    if (frames.length < MIN_FRAMES) return null;
    return frames;
  }

  onFrame(frame: GloveFrame): void {
    if (this.state === 'collecting') {
      this.collectedFrames.push(frame);
    }
  }
}
