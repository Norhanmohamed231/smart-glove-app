export type ModelStatus = 'idle' | 'loading' | 'ready' | 'error';
export type AiCollectionState = 'idle' | 'collecting' | 'predicting';

export interface PreprocessingConfig {
  smooth_window: number;
  resample_target: number;
  confidence_threshold: number;
  gesture_collection_seconds: number;
  motion_threshold: number;
  window_size: number;
  sustained_threshold: number;
}

export interface ModelConfig {
  sequence_length: number;
  feature_cols: string[];
  input_size: number;
  hidden_size: number;
  num_layers: number;
  classes: string[];
  finger_thresholds: number[];
  scaler_mean: number[];
  scaler_scale: number[];
  preprocessing: PreprocessingConfig;
}

export type WordSignatures = Record<string, boolean[]>;

export interface PredictionResult {
  label: string;
  confidence: number;
  isUnknown: boolean;
}
