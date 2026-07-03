import type { GloveFrame, GestureResult } from '../parser/types';
import type { IGestureProcessor } from '../pipeline/IGestureProcessor';
import type { AiCollectionState } from './types';
import { GestureCollector } from './GestureCollector';
import { lstmInferenceEngine } from './LSTMInferenceEngine';
import { getModelConfig } from './modelAssets';
import { AI_UNKNOWN_AR } from './aiLabelMap';

type PredictionListener = (result: GestureResult) => void;
type StateListener = (state: AiCollectionState) => void;

export class LSTMGestureProcessor implements IGestureProcessor {
  readonly mode = 'sensor' as const;

  private collector = new GestureCollector(getModelConfig());
  private predicting = false;
  private lastFrames: GloveFrame[] = [];
  private predictionListeners = new Set<PredictionListener>();
  private stateListeners = new Set<StateListener>();

  onFrame(frame: GloveFrame): GestureResult | null {
    if (!lstmInferenceEngine.isReady() || this.predicting) {
      return null;
    }

    const collection = this.collector.onFrame(frame);
    this.emitState(collection.state);

    if (!collection.frames || collection.frames.length === 0) {
      return null;
    }

    this.lastFrames = collection.frames;
    this.predicting = true;
    this.emitState('predicting');

    void this.runPrediction(collection.frames);
    return null;
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
    const frames = this.collector.getCollectedCount() > 0 ? this.lastFrames : [];
    return frames.length > 0 ? frames[frames.length - 1] : null;
  }

  getCollectionState(): AiCollectionState {
    return this.predicting ? 'predicting' : this.collector.getState();
  }

  reset(): void {
    this.collector.reset();
    this.predicting = false;
    this.lastFrames = [];
    this.emitState('waiting_motion');
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
      this.emitState('waiting_motion');
    }
  }

  private emitState(state: AiCollectionState): void {
    for (const listener of this.stateListeners) {
      listener(state);
    }
  }
}
