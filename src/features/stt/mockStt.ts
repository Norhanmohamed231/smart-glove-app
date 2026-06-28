import { AR_TO_EN } from '../binary/defaultDictionary';

export interface MockSttResult {
  arabic: string;
  english: string;
  accuracy: number;
}

const SAMPLE_PHRASES: { arabic: string; english: string }[] = [
  { arabic: 'مرحبا، كيف حالك؟', english: 'Hello, how are you?' },
  { arabic: 'سعدت بلقائك', english: 'Nice to meet you' },
  { arabic: 'شكرا جزيلا', english: 'Thank you very much' },
  { arabic: 'من فضلك ساعدني', english: 'Please help me' },
  { arabic: 'أنا بخير', english: 'I am fine' },
];

/**
 * TODO: Replace with a real speech-to-text engine (e.g. @react-native-voice/voice)
 * plus microphone permissions. Currently returns a random mock recognition.
 */
export function recognizeSpeechMock(): MockSttResult {
  const pick = SAMPLE_PHRASES[Math.floor(Math.random() * SAMPLE_PHRASES.length)];
  const english = AR_TO_EN[pick.arabic] ?? pick.english;
  const accuracy = 92 + Math.floor(Math.random() * 7);
  return { arabic: pick.arabic, english, accuracy };
}
