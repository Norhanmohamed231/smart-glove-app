import { Platform } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  type ExpoSpeechRecognitionErrorEvent,
  type ExpoSpeechRecognitionResultEvent,
} from 'expo-speech-recognition';

import { getModelConfig } from '../ml/modelAssets';
import {
  STT_NETWORK_ERROR_AR,
  STT_NO_GOOGLE_AR,
  STT_NO_SPEECH_AR,
  STT_ONLINE_TRYING_AR,
  STT_PERMISSION_DENIED_AR,
  STT_UNAVAILABLE_AR,
  type SttAvailability,
  type SttErrorCode,
  type SttMode,
  type SttResult,
  type SttStatus,
} from './types';

const PREFERRED_LOCALES = ['ar-EG', 'ar-SA'] as const;
const FALLBACK_GOOGLE_PACKAGES = [
  'com.google.android.googlequicksearchbox',
  'com.google.android.as',
] as const;

type ResultListener = (result: SttResult) => void;
type ErrorListener = (code: SttErrorCode, message: string) => void;
type ListeningListener = (listening: boolean) => void;
type InfoListener = (message: string | null) => void;

interface LocaleResolution {
  locale: string;
  mode: SttMode;
  optimistic?: boolean;
}

function normalizeConfidence(value: number): number {
  if (value < 0) return 90;
  return Math.round(Math.min(1, value) * 100);
}

function pickPreferredArabic(pool: string[]): string | null {
  for (const preferred of PREFERRED_LOCALES) {
    const match = pool.find((locale) => locale.toLowerCase() === preferred.toLowerCase());
    if (match) return match;
  }
  return pool.find((locale) => locale.toLowerCase().startsWith('ar-')) ?? null;
}

function getAndroidApiLevel(): number {
  if (Platform.OS !== 'android') return 0;
  return typeof Platform.Version === 'number'
    ? Platform.Version
    : parseInt(String(Platform.Version), 10) || 0;
}

class SttService {
  private status: SttStatus = 'unchecked';
  private locale: string | null = null;
  private mode: SttMode | null = null;
  private androidServicePackage: string | null = null;
  private serviceCandidates: string[] = [];
  private serviceCandidateIndex = 0;
  private errorMessage: string | null = null;
  private infoMessage: string | null = null;
  private listening = false;
  private listenersAttached = false;

  private resultListener: ResultListener | null = null;
  private errorListener: ErrorListener | null = null;
  private listeningListener: ListeningListener | null = null;
  private infoListener: InfoListener | null = null;

  private resultSub: { remove: () => void } | null = null;
  private errorSub: { remove: () => void } | null = null;
  private endSub: { remove: () => void } | null = null;
  private nomatchSub: { remove: () => void } | null = null;

  getAvailability(): SttAvailability {
    return {
      status: this.status,
      locale: this.locale,
      mode: this.mode,
      errorMessage: this.errorMessage,
      infoMessage: this.infoMessage,
    };
  }

  isAvailable(): boolean {
    return this.status === 'available' && this.locale != null;
  }

  getMode(): SttMode | null {
    return this.mode;
  }

  isListening(): boolean {
    return this.listening;
  }

  getServiceCandidates(): string[] {
    return [...this.serviceCandidates];
  }

  setCallbacks(
    onResult: ResultListener,
    onError: ErrorListener,
    onListeningChange: ListeningListener,
    onInfo?: InfoListener,
  ): void {
    this.resultListener = onResult;
    this.errorListener = onError;
    this.listeningListener = onListeningChange;
    this.infoListener = onInfo ?? null;
  }

  clearCallbacks(): void {
    this.resultListener = null;
    this.errorListener = null;
    this.listeningListener = null;
    this.infoListener = null;
  }

  async checkAvailability(): Promise<SttAvailability> {
    this.status = 'checking';
    this.errorMessage = null;
    this.infoMessage = null;
    this.locale = null;
    this.mode = null;
    this.serviceCandidateIndex = 0;

    if (Platform.OS === 'android') {
      this.serviceCandidates = this.discoverAndroidServicePackages();
      const hasService = this.serviceCandidates.length > 0;
      const systemSaysAvailable = ExpoSpeechRecognitionModule.isRecognitionAvailable();

      if (!hasService && !systemSaysAvailable) {
        this.status = 'unavailable';
        this.errorMessage = STT_NO_GOOGLE_AR;
        return this.getAvailability();
      }
    } else if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
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

    const resolution =
      Platform.OS === 'android'
        ? await this.resolveAndroidArabicLocale()
        : await this.resolveIosArabicLocale();

    if (!resolution) {
      this.status = 'unavailable';
      this.errorMessage = STT_UNAVAILABLE_AR;
      return this.getAvailability();
    }

    this.locale = resolution.locale;
    this.mode = resolution.mode;
    this.status = 'available';

    if (resolution.optimistic) {
      this.infoMessage = STT_ONLINE_TRYING_AR;
      this.infoListener?.(this.infoMessage);
    }

    return this.getAvailability();
  }

  async startListening(): Promise<void> {
    if (!this.locale) {
      const availability = await this.checkAvailability();
      if (availability.status !== 'available' || !availability.locale) {
        this.errorListener?.('not_available', availability.errorMessage ?? STT_UNAVAILABLE_AR);
        return;
      }
    }

    this.attachNativeListeners();
    this.serviceCandidateIndex = Math.max(
      0,
      this.serviceCandidates.indexOf(this.androidServicePackage ?? ''),
    );

    this.listening = true;
    this.listeningListener?.(true);
    this.beginRecognition();
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

  private discoverAndroidServicePackages(): string[] {
    const packages = new Set<string>();

    try {
      const defaultService = ExpoSpeechRecognitionModule.getDefaultRecognitionService();
      if (defaultService.packageName) {
        packages.add(defaultService.packageName);
      }
    } catch {
      // ignore
    }

    try {
      const assistant = ExpoSpeechRecognitionModule.getAssistantService();
      if (assistant.packageName) {
        packages.add(assistant.packageName);
      }
    } catch {
      // ignore
    }

    try {
      for (const pkg of ExpoSpeechRecognitionModule.getSpeechRecognitionServices()) {
        if (pkg) packages.add(pkg);
      }
    } catch {
      // ignore
    }

    for (const pkg of FALLBACK_GOOGLE_PACKAGES) {
      packages.add(pkg);
    }

    return [...packages];
  }

  private async resolveAndroidArabicLocale(): Promise<LocaleResolution | null> {
    const candidates =
      this.serviceCandidates.length > 0
        ? this.serviceCandidates
        : [...FALLBACK_GOOGLE_PACKAGES];

    const androidApi = getAndroidApiLevel();
    if (androidApi > 0 && androidApi < 33) {
      this.androidServicePackage = candidates[0] ?? null;
      return {
        locale: 'ar-EG',
        mode: 'online',
        optimistic: true,
      };
    }

    for (const servicePackage of candidates) {
      try {
        const { locales, installedLocales } =
          await ExpoSpeechRecognitionModule.getSupportedLocales({
            androidRecognitionServicePackage: servicePackage,
          });

        const onDeviceLocale = pickPreferredArabic(installedLocales);
        if (onDeviceLocale) {
          this.androidServicePackage = servicePackage;
          return { locale: onDeviceLocale, mode: 'on_device' };
        }

        const onlineLocale = pickPreferredArabic(locales);
        if (onlineLocale) {
          this.androidServicePackage = servicePackage;
          return { locale: onlineLocale, mode: 'online' };
        }
      } catch {
        // try next package
      }
    }

    if (candidates.length > 0) {
      this.androidServicePackage = candidates[0];
      return {
        locale: 'ar-EG',
        mode: 'online',
        optimistic: true,
      };
    }

    if (ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
      return {
        locale: 'ar-EG',
        mode: 'online',
        optimistic: true,
      };
    }

    return null;
  }

  private async resolveIosArabicLocale(): Promise<LocaleResolution | null> {
    try {
      const { locales, installedLocales } =
        await ExpoSpeechRecognitionModule.getSupportedLocales({});

      const onDeviceLocale = pickPreferredArabic(installedLocales);
      if (onDeviceLocale) {
        return { locale: onDeviceLocale, mode: 'on_device' };
      }

      const onlineLocale = pickPreferredArabic(locales);
      if (onlineLocale) {
        return { locale: onlineLocale, mode: 'online' };
      }
    } catch {
      return null;
    }
    return { locale: 'ar-EG', mode: 'online', optimistic: true };
  }

  private beginRecognition(): void {
    if (!this.locale || !this.mode) return;

    const contextualStrings = getModelConfig().classes;
    const useOnDevice = this.mode === 'on_device';
    const servicePackage = this.androidServicePackage;

    const startOptions: Parameters<typeof ExpoSpeechRecognitionModule.start>[0] = {
      lang: this.locale,
      interimResults: true,
      continuous: false,
      maxAlternatives: 1,
      contextualStrings,
    };

    if (servicePackage) {
      startOptions.androidRecognitionServicePackage = servicePackage;
    }

    if (useOnDevice) {
      startOptions.requiresOnDeviceRecognition = true;
      startOptions.addsPunctuation = true;
    }

    ExpoSpeechRecognitionModule.start(startOptions);
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
    if (
      Platform.OS === 'android' &&
      (event.error === 'service-not-allowed' || event.error === 'language-not-supported') &&
      this.tryNextServicePackage()
    ) {
      return;
    }

    const code = this.mapErrorCode(event.error);
    const message = this.mapErrorMessage(event);
    this.errorListener?.(code, message);
    this.setListening(false);
  }

  private tryNextServicePackage(): boolean {
    if (this.serviceCandidates.length === 0) return false;

    const nextIndex = this.serviceCandidateIndex + 1;
    if (nextIndex >= this.serviceCandidates.length) return false;

    this.serviceCandidateIndex = nextIndex;
    this.androidServicePackage = this.serviceCandidates[nextIndex];

    if (this.mode === 'on_device') {
      this.mode = 'online';
    }

    this.beginRecognition();
    return true;
  }

  private mapErrorCode(error: ExpoSpeechRecognitionErrorEvent['error']): SttErrorCode {
    switch (error) {
      case 'not-allowed':
        return 'permission_denied';
      case 'language-not-supported':
      case 'service-not-allowed':
        return 'arabic_not_installed';
      case 'network':
        return 'recognition_error';
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
        return this.serviceCandidates.length === 0 ? STT_NO_GOOGLE_AR : STT_UNAVAILABLE_AR;
      case 'network':
        return STT_NETWORK_ERROR_AR;
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
