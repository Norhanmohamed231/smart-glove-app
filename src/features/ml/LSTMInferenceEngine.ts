import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import type { InferenceSession } from 'onnxruntime-react-native';

import onnxModel from '@/assets/models/sign_lstm.onnx';
import type { ModelConfig, ModelStatus, PredictionResult, WordSignatures } from './types';
import { getModelConfig, getWordSignatures } from './modelAssets';
import { preprocessGestureFrames } from './Preprocessor';
import { filterLogits, getCandidateClasses, softmax } from './HybridFilter';
import { AI_UNKNOWN_AR } from './aiLabelMap';
import type { GloveFrame } from '../parser/types';

type OrtModule = typeof import('onnxruntime-react-native');

let ortModulePromise: Promise<OrtModule> | null = null;

async function getOrtModule(): Promise<OrtModule> {
  if (!ortModulePromise) {
    ortModulePromise = import('onnxruntime-react-native');
  }
  return ortModulePromise;
}

class LSTMInferenceEngine {
  private session: InferenceSession | null = null;
  private status: ModelStatus = 'idle';
  private error: string | null = null;
  private readonly config: ModelConfig = getModelConfig();
  private readonly signatures: WordSignatures = getWordSignatures();

  getStatus(): ModelStatus {
    return this.status;
  }

  getError(): string | null {
    return this.error;
  }

  isReady(): boolean {
    return this.status === 'ready' && this.session != null;
  }

  async load(): Promise<void> {
    if (this.status === 'loading' || this.status === 'ready') return;

    this.status = 'loading';
    this.error = null;

    try {
      const { InferenceSession } = await getOrtModule();

      const asset = Asset.fromModule(onnxModel);
      await asset.downloadAsync();

      if (!asset.localUri) {
        throw new Error('ONNX asset URI is missing');
      }

      const dest = `${FileSystem.documentDirectory}sign_lstm.onnx`;
      await FileSystem.copyAsync({ from: asset.localUri, to: dest });
      const modelPath = dest.replace('file://', '');

      this.session = await InferenceSession.create(modelPath);
      this.status = 'ready';
    } catch (err) {
      this.status = 'error';
      this.error = err instanceof Error ? err.message : 'Failed to load ONNX model';
      this.session = null;
      throw err;
    }
  }

  async predict(frames: GloveFrame[]): Promise<PredictionResult> {
    if (!this.session) {
      throw new Error('ONNX session is not loaded');
    }

    const { Tensor } = await getOrtModule();
    const input = preprocessGestureFrames(frames, this.config);
    const candidates = getCandidateClasses(frames, this.config, this.signatures);
    const { sequence_length, input_size, classes, preprocessing } = this.config;

    const tensor = new Tensor('float32', input, [1, sequence_length, input_size]);
    const outputs = await this.session.run({ input: tensor });
    const logits = outputs.logits.data as Float32Array;
    const probs = softmax(logits);
    const { label, confidence } = filterLogits(probs, classes, candidates);
    const isUnknown = confidence < preprocessing.confidence_threshold;

    return {
      label: isUnknown ? AI_UNKNOWN_AR : label,
      confidence: confidence * 100,
      isUnknown,
    };
  }
}

export const lstmInferenceEngine = new LSTMInferenceEngine();
