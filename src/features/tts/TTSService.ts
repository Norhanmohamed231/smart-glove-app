import * as Speech from 'expo-speech';
import { TTS_COOLDOWN_MS } from '../binary/constants';

class TTSService {
  private lastSpokenAt = 0;
  private lastText = '';

  async speak(text: string, force = false): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed) return;

    const now = Date.now();
    if (!force && trimmed === this.lastText && now - this.lastSpokenAt < TTS_COOLDOWN_MS) {
      return;
    }

    this.lastSpokenAt = now;
    this.lastText = trimmed;

    Speech.stop();
    Speech.speak(trimmed, {
      language: 'ar',
      rate: 0.95,
    });
  }

  stop(): void {
    Speech.stop();
  }
}

export const ttsService = new TTSService();
