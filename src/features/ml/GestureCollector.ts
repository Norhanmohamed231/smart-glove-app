import type { GloveFrame } from '../parser/types';
import type { AiCollectionState, ModelConfig } from './types';

export interface GestureCollectionResult {
  state: AiCollectionState;
  frames: GloveFrame[] | null;
}

export class GestureCollector {
  private state: AiCollectionState = 'waiting_motion';
  private motionBuffer: boolean[] = [];
  private collectedFrames: GloveFrame[] = [];
  private collectionStartedAt = 0;

  constructor(private config: ModelConfig) {}

  reset(): void {
    this.state = 'waiting_motion';
    this.motionBuffer = [];
    this.collectedFrames = [];
    this.collectionStartedAt = 0;
  }

  getState(): AiCollectionState {
    return this.state;
  }

  getCollectedCount(): number {
    return this.collectedFrames.length;
  }

  onFrame(frame: GloveFrame): GestureCollectionResult {
    if (this.state === 'waiting_motion') {
      return this.handleWaiting(frame);
    }

    return this.handleCollecting(frame);
  }

  private handleWaiting(frame: GloveFrame): GestureCollectionResult {
    const motion =
      Math.abs(frame.imu.ax) + Math.abs(frame.imu.ay) + Math.abs(frame.imu.az);
    const isActive = motion > this.config.preprocessing.motion_threshold;

    this.motionBuffer.push(isActive);
    const windowSize = this.config.preprocessing.window_size;
    if (this.motionBuffer.length > windowSize) {
      this.motionBuffer.shift();
    }

    const sustained = this.motionBuffer.filter(Boolean).length;
    if (sustained >= this.config.preprocessing.sustained_threshold) {
      this.state = 'collecting';
      this.collectedFrames = [frame];
      this.collectionStartedAt = Date.now();
      return { state: 'collecting', frames: null };
    }

    return { state: 'waiting_motion', frames: null };
  }

  private handleCollecting(frame: GloveFrame): GestureCollectionResult {
    this.collectedFrames.push(frame);
    const elapsedSec = (Date.now() - this.collectionStartedAt) / 1000;

    if (elapsedSec < this.config.preprocessing.gesture_collection_seconds) {
      return { state: 'collecting', frames: null };
    }

    const frames = [...this.collectedFrames];
    this.reset();
    return { state: 'predicting', frames };
  }
}
