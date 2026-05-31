import type { AppMode, GestureResult, GloveFrame } from '../parser/types';
import { BinaryGestureProcessor } from '../binary/BinaryGestureProcessor';
import { LSTMGestureProcessor } from '../ml/LSTMGestureProcessor';
import type { IGestureProcessor } from './IGestureProcessor';

type ResultListener = (result: GestureResult) => void;

export class GesturePipelineRouter {
  private binaryProcessor = new BinaryGestureProcessor();
  private lstmProcessor = new LSTMGestureProcessor();
  private activeMode: AppMode = 'binary';
  private resultListeners = new Set<ResultListener>();
  private lastLiveResult: GestureResult | null = null;

  setActiveMode(mode: AppMode): void {
    if (mode === this.activeMode) return;
    this.getProcessor(this.activeMode).reset();
    this.activeMode = mode;
    this.lastLiveResult = null;
  }

  getActiveMode(): AppMode {
    return this.activeMode;
  }

  getBinaryProcessor(): BinaryGestureProcessor {
    return this.binaryProcessor;
  }

  getLstmProcessor(): LSTMGestureProcessor {
    return this.lstmProcessor;
  }

  onResult(listener: ResultListener): () => void {
    this.resultListeners.add(listener);
    return () => this.resultListeners.delete(listener);
  }

  getLastLiveResult(): GestureResult | null {
    return this.lastLiveResult;
  }

  processFrame(frame: GloveFrame): GestureResult | null {
    const processor = this.getProcessor(this.activeMode);
    const result = processor.onFrame(frame);

    if (!result) return null;

    this.lastLiveResult = result;

    if (result.isStable) {
      for (const listener of this.resultListeners) {
        listener(result);
      }
    }

    return result;
  }

  processManualBits(bits: number[]): GestureResult {
    const result = this.binaryProcessor.processManualBits(bits);
    this.lastLiveResult = result;

    for (const listener of this.resultListeners) {
      listener(result);
    }

    return result;
  }

  reset(): void {
    this.binaryProcessor.reset();
    this.lstmProcessor.reset();
    this.lastLiveResult = null;
  }

  private getProcessor(mode: AppMode): IGestureProcessor {
    return mode === 'binary' ? this.binaryProcessor : this.lstmProcessor;
  }
}

export const gesturePipeline = new GesturePipelineRouter();
