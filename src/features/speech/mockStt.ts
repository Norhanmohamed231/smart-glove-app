/**
 * Placeholder speech-to-text. Returns a canned phrase with a mock accuracy.
 * TODO: replace with a real STT library (e.g. @react-native-voice/voice)
 * plus microphone permissions handling.
 */
export interface MockSttResult {
  phrase: string;
  arabic: string;
  accuracy: number;
}

const SAMPLES: MockSttResult[] = [
  { phrase: 'Hello, how are you?', arabic: 'مرحبا، كيف حالك؟', accuracy: 95 },
  { phrase: 'Nice to meet you', arabic: 'سعيد بلقائك', accuracy: 96 },
  { phrase: 'Thank you very much', arabic: 'شكرا جزيلا', accuracy: 94 },
  { phrase: 'See you later', arabic: 'أراك لاحقا', accuracy: 93 },
];

export function runMockStt(): MockSttResult {
  return SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
}
