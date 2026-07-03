import { Platform } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  type ExpoSpeechRecognitionErrorEvent,
  type ExpoSpeechRecognitionResultEvent,
} from 'expo-speech-recognition';

import { getModelConfig } from '../ml/modelAssets';
import {
  STT_NO_SPEECH_AR,
  STT_PERMISSION_DENIED_AR,
  STT_UNAVAILABLE_AR,
  type SttAvailability,
  type SttErrorCode,
  type SttResult,
  type SttStatus,
} from './types';

const PREFERRED_LOCALES = ['ar-EG', 'ar-SA'] as const;
const ANDROID_SERVICE_PACKAGES = [
  'com.google.android.googlequicksearchbox',
  'com.google.android.as',
] as const;

type ResultListener = (result: SttResult) => void;
type ErrorListener = (code: SttErrorCode, message: string) => void;
type ListeningListener = (listening: boolean) => void;

function normalizeConfidence(value: number): number {
  if (value < 0) return 90;
  return Math.round(Math.min(1, value) * 100);
}

function pickArabicLocale(installedLocales: string[], locales: string[]): string | null {
  const pool = installedLocales.length > 0 ? installedLocales : [];
  for (const preferred of PREFERRED_LOCALES) {
    const match = pool.find((locale) => locale.toLowerCase() === preferred.toLowerCase());
    if (match) return match;
  }

  const fallback = pool.find((locale) => locale.toLowerCase().startsWith('ar-'));
  if (fallback) return fallback;

  for (const preferred of PREFERRED_LOCALES) {
    const match = locales.find((locale) => locale.toLowerCase() === preferred.toLowerCase());
    if (match) return match;
  }

  return locales.find((locale) => locale.toLowerCase().startsWith('ar-')) ?? null;
}

class SttService {
  private status: SttStatus = 'unchecked';
  private locale: string | null = null;
  private errorMessage: string | null = null;
  private listening = false;
  private listenersAttached = false;

  private resultListener: ResultListener | null = null;
  private errorListener: ErrorListener | null = null;
  private listeningListener: ListeningListener | null = null;

  private resultSub: { remove: () => void } | null = null;
  private errorSub: { remove: () => void } | null = null;
  private endSub: { remove: () => void } | null = null;
  private nomatchSub: { remove: () => void } | null = null;

  getAvailability(): SttAvailability {
    return {
      status: this.status,
      locale: this.locale,
      errorMessage: this.errorMessage,
    };
  }

  isAvailable(): boolean {
    return this.status === 'available' && this.locale != null;
  }

  isListening(): boolean {
    return this.listening;
  }

  setCallbacks(
    onResult: ResultListener,
    onError: ErrorListener,
    onListeningChange: ListeningListener,
  ): void {
    this.resultListener = onResult;
    this.errorListener = onError;
    this.listeningListener = onListeningChange;
  }

  clearCallbacks(): void {
    this.resultListener = null;
    this.errorListener = null;
    this.listeningListener = null;
  }

  async checkAvailability(): Promise<SttAvailability> {
    this.status = 'checking';
    this.errorMessage = null;
    this.locale = null;

    if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
      this.status = 'unavailable';
      this.errorMessage = STT_UNAVAILABLE_AR;
      return this.getAvailability();
    }

    if (!ExpoSpeechRecognitionModule.supportsOnDeviceRecognition()) {
      this.status = 'unavailable';
      this.errorMessage = STT_UNAVAILABLE_AR;
      return this.getAvailability();
    }

    const permissions = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permissions.granted) {
      this.status = 'unavailable';
      this.errorMessage = STT_PERMISSION_DENIED_AR;
      return this.getAvailability();
    }

    if (Platform.OS === 'android') {
      this.locale = await this.resolveAndroidArabicLocale();
    } else {
      this.locale = await this.resolveIosArabicLocale();
    }

    if (!this.locale) {
      this.status = 'unavailable';
      this.errorMessage = STT_UNAVAILABLE_AR;
      return this.getAvailability();
    }

    this.status = 'available';
    return this.getAvailability();
  }

  async startListening(): Promise<void> {
    if (!this.isAvailable() || !this.locale) {
      this.errorListener?.('not_available', this.errorMessage ?? STT_UNAVAILABLE_AR);
      return;
    }

    this.attachNativeListeners();

    this.listening = true;
    this.listeningListener?.(true);

    const contextualStrings = getModelConfig().classes;

    ExpoSpeechRecognitionModule.start({
      lang: this.locale,
      interimResults: true,
      continuous: false,
      maxAlternatives: 1,
      requiresOnDeviceRecognition: true,
      addsPunctuation: true,
      contextualStrings,
      androidRecognitionServicePackage: ANDROID_SERVICE_PACKAGES[0],
    });
  }

  stopListening(): void {
    if (!this.listening) return;
    ExpoSpeechRecognitionModule.stop();
  }

  abortListening(): void {
    if (!this.listening) return;
    ExpoSpeechRecognitionModule.abort();
    this.setListening(false);
  }

  private async resolveAndroidArabicLocale(): Promise<string | null> {
    for (const servicePackage of ANDROID_SERVICE_PACKAGES) {
      try {
        const { locales, installedLocales } =
          await ExpoSpeechRecognitionModule.getSupportedLocales({
            androidRecognitionServicePackage: servicePackage,
          });

        const locale = pickArabicLocale(installedLocales, locales);
        if (locale && installedLocales.some((l) => l.toLowerCase() === locale.toLowerCase())) {
          return locale;
        }
      } catch {
        // try next package
      }
    }
    return null;
  }

  private async resolveIosArabicLocale(): Promise<string | null> {
    try {
      const { locales, installedLocales } =
        await ExpoSpeechRecognitionModule.getSupportedLocales({});
      return pickArabicLocale(installedLocales, locales);
    } catch {
      return null;
    }
  }

  private attachNativeListeners(): void {
    if (this.listenersAttached) return;

    this.resultSub = ExpoSpeechRecognitionModule.addListener(
      'result',
      (event: ExpoSpeechRecognitionResultEvent) => {
        this.handleResult(event);
      },
    );

    this.errorSub = ExpoSpeechRecognitionModule.addListener(
      'error',
      (event: ExpoSpeechRecognitionErrorEvent) => {
        this.handleError(event);
      },
    );

    this.endSub = ExpoSpeechRecognitionModule.addListener('end', () => {
      this.setListening(false);
    });

    this.nomatchSub = ExpoSpeechRecognitionModule.addListener('nomatch', () => {
      this.errorListener?.('no_speech', STT_NO_SPEECH_AR);
      this.setListening(false);
    });

    this.listenersAttached = true;
  }

  private handleResult(event: ExpoSpeechRecognitionResultEvent): void {
    const top = event.results[0];
    if (!top?.transcript) return;

    const result: SttResult = {
      arabic: top.transcript.trim(),
      confidence: normalizeConfidence(top.confidence),
      isFinal: event.isFinal,
    };

    this.resultListener?.(result);

    if (event.isFinal) {
      this.setListening(false);
    }
  }

  private handleError(event: ExpoSpeechRecognitionErrorEvent): void {
    const code = this.mapErrorCode(event.error);
    const message = this.mapErrorMessage(event);
    this.errorListener?.(code, message);
    this.setListening(false);
  }

  private mapErrorCode(error: ExpoSpeechRecognitionErrorEvent['error']): SttErrorCode {
    switch (error) {
      case 'not-allowed':
        return 'permission_denied';
      case 'language-not-supported':
      case 'service-not-allowed':
        return 'arabic_not_installed';
      case 'no-speech':
      case 'speech-timeout':
        return 'no_speech';
      case 'aborted':
        return 'aborted';
      default:
        return 'recognition_error';
    }
  }

  private mapErrorMessage(event: ExpoSpeechRecognitionErrorEvent): string {
    switch (event.error) {
      case 'not-allowed':
        return STT_PERMISSION_DENIED_AR;
      case 'language-not-supported':
      case 'service-not-allowed':
        return STT_UNAVAILABLE_AR;
      case 'no-speech':
      case 'speech-timeout':
        return STT_NO_SPEECH_AR;
      case 'aborted':
        return '';
      default:
        return event.message || STT_NO_SPEECH_AR;
    }
  }

  private setListening(value: boolean): void {
    if (this.listening === value) return;
    this.listening = value;
    this.listeningListener?.(value);
  }
}

export const sttService = new SttService();
