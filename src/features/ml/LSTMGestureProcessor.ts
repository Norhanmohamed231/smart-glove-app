import type { GloveFrame, GestureResult } from '../parser/types';
import type { IGestureProcessor } from '../pipeline/IGestureProcessor';
import type { AiCollectionState } from './types';
import { GestureCollector } from './GestureCollector';
import { lstmInferenceEngine } from './LSTMInferenceEngine';
import { AI_UNKNOWN_AR } from './aiLabelMap';

type PredictionListener = (result: GestureResult) => void;
type StateListener = (state: AiCollectionState) => void;

export class LSTMGestureProcessor implements IGestureProcessor {
  readonly mode = 'sensor' as const;

  private collector = new GestureCollector();
  private predicting = false;
  private lastFrames: GloveFrame[] = [];
  private predictionListeners = new Set<PredictionListener>();
  private stateListeners = new Set<StateListener>();

  onFrame(frame: GloveFrame): GestureResult | null {
    if (!lstmInferenceEngine.isReady() || this.predicting) {
      return null;
    }

    if (this.collector.getState() === 'collecting') {
      this.collector.onFrame(frame);
    }

    return null;
  }

  startRecording(): boolean {
    if (!lstmInferenceEngine.isReady() || this.predicting) return false;
    const started = this.collector.start();
    if (started) this.emitState('collecting');
    return started;
  }

  stopRecording(): boolean {
    if (this.predicting) return false;

    const frames = this.collector.stop();
    if (!frames) {
      this.emitState('idle');
      return false;
    }

    this.lastFrames = frames;
    this.predicting = true;
    this.emitState('predicting');
    void this.runPrediction(frames);
    return true;
  }

  onPrediction(listener: PredictionListener): () => void {
    this.predictionListeners.add(listener);
    return () => this.predictionListeners.delete(listener);
  }

  onStateChange(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  getBuffer(): GloveFrame[] {
    return [...this.lastFrames];
  }

  getLatestFrame(): GloveFrame | null {
    return this.lastFrames.length > 0 ? this.lastFrames[this.lastFrames.length - 1] : null;
  }

  getCollectionState(): AiCollectionState {
    if (this.predicting) return 'predicting';
    return this.collector.getState();
  }

  getCollectedCount(): number {
    return this.collector.getCollectedCount();
  }

  isRecording(): boolean {
    return this.collector.getState() === 'collecting';
  }

  reset(): void {
    this.collector.reset();
    this.predicting = false;
    this.lastFrames = [];
    this.emitState('idle');
  }

  private async runPrediction(frames: GloveFrame[]): Promise<void> {
    try {
      const prediction = await lstmInferenceEngine.predict(frames);
      const result: GestureResult = {
        mode: 'sensor',
        label: prediction.label,
        phrase: prediction.label,
        confidence: prediction.confidence,
        isStable: !prediction.isUnknown,
      };

      for (const listener of this.predictionListeners) {
        listener(result);
      }
    } catch {
      const fallback: GestureResult = {
        mode: 'sensor',
        label: AI_UNKNOWN_AR,
        phrase: AI_UNKNOWN_AR,
        confidence: 0,
        isStable: false,
      };

      for (const listener of this.predictionListeners) {
        listener(fallback);
      }
    } finally {
      this.predicting = false;
      this.emitState('idle');
    }
  }

  private emitState(state: AiCollectionState): void {
    for (const listener of this.stateListeners) {
      listener(state);
    }
  }
}
