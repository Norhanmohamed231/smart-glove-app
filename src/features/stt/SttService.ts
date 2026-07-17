import { Platform } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  type ExpoSpeechRecognitionErrorEvent,
  type ExpoSpeechRecognitionResultEvent,
} from 'expo-speech-recognition';

import { getModelConfig } from '../ml/modelAssets';
import {
  ANDROID_ON_DEVICE_SERVICE,
  buildAndroidLocaleCheckOrder,
  buildAndroidOnlineCheckOrder,
  FALLBACK_GOOGLE_PACKAGES,
  getPreferredOnlinePackage,
  pickPreferredArabic,
} from './sttLocaleUtils';
import {
  STT_NETWORK_ERROR_AR,
  STT_NO_GOOGLE_AR,
  STT_NO_SPEECH_AR,
  STT_PERMISSION_DENIED_AR,
  STT_UNAVAILABLE_AR,
  type SttAvailability,
  type SttErrorCode,
  type SttMode,
  type SttResult,
  type SttStatus,
} from './types';

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
  private offlinePackAvailable = false;
  private androidServicePackage: string | null = null;
  private serviceCandidates: string[] = [];
  private serviceCandidateIndex = 0;
  private errorMessage: string | null = null;
  private infoMessage: string | null = null;
  private listening = false;
  private restarting = false;
  private listenersAttached = false;

  private resultListener: ResultListener | null = null;
  private errorListener: ErrorListener | null = null;
  private listeningListener: ListeningListener | null = null;
  private infoListener: InfoListener | null = null;

  private resultSub: { remove: () => void } | null = null;
  private errorSub: { remove: () => void } | null = null;
  private startSub: { remove: () => void } | null = null;
  private endSub: { remove: () => void } | null = null;
  private nomatchSub: { remove: () => void } | null = null;

  getAvailability(): SttAvailability {
    return {
      status: this.status,
      locale: this.locale,
      mode: this.mode,
      offlinePackAvailable: this.offlinePackAvailable,
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

  isSessionActive(): boolean {
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
    this.listeningListener(this.listening);
  }

  clearCallbacks(): void {
    this.resultListener = null;
    this.errorListener = null;
    this.listeningListener = null;
    this.infoListener = null;
  }

  async checkAvailability(): Promise<SttAvailability> {
    if (this.listening) {
      return this.getAvailability();
    }

    this.status = 'checking';
    this.errorMessage = null;
    this.infoMessage = null;
    this.locale = null;
    this.mode = null;
    this.offlinePackAvailable = false;
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

    return this.getAvailability();
  }

  async startListening(): Promise<void> {
    if (this.listening) return;

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

    this.setListening(true);
    this.beginRecognition();
  }

  stopListening(): void {
    if (!this.listening) return;
    this.restarting = false;
    ExpoSpeechRecognitionModule.stop();
  }

  abortListening(): void {
    if (!this.listening) return;
    this.restarting = false;
    ExpoSpeechRecognitionModule.abort();
    this.setListening(false);
  }

  private setListening(value: boolean): void {
    if (this.listening === value) return;
    this.listening = value;
    if (!value) {
      this.restarting = false;
    }
    this.listeningListener?.(value);
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
    const discovered =
      this.serviceCandidates.length > 0 ? this.serviceCandidates : [...FALLBACK_GOOGLE_PACKAGES];
    const offlineCheckOrder = buildAndroidLocaleCheckOrder(discovered);
    const onlineCheckOrder = buildAndroidOnlineCheckOrder(discovered);

    const androidApi = getAndroidApiLevel();
    if (androidApi > 0 && androidApi < 33) {
      this.androidServicePackage = getPreferredOnlinePackage(discovered);
      return {
        locale: 'ar-EG',
        mode: 'online',
        optimistic: true,
      };
    }

    let offlineLocale: string | null = null;
    for (const servicePackage of offlineCheckOrder) {
      try {
        const { installedLocales } = await ExpoSpeechRecognitionModule.getSupportedLocales({
          androidRecognitionServicePackage: servicePackage,
        });
        offlineLocale = pickPreferredArabic(installedLocales);
        if (offlineLocale) break;
      } catch {
        // try next package
      }
    }
    this.offlinePackAvailable = offlineLocale != null;

    for (const servicePackage of onlineCheckOrder) {
      try {
        const { locales } = await ExpoSpeechRecognitionModule.getSupportedLocales({
          androidRecognitionServicePackage: servicePackage,
        });

        const onlineLocale = pickPreferredArabic(locales);
        if (onlineLocale) {
          this.androidServicePackage = getPreferredOnlinePackage([servicePackage, ...discovered]);
          return { locale: onlineLocale, mode: 'online' };
        }
      } catch {
        // try next package
      }
    }

    if (offlineLocale) {
      this.androidServicePackage = ANDROID_ON_DEVICE_SERVICE;
      return { locale: offlineLocale, mode: 'on_device' };
    }

    this.androidServicePackage = getPreferredOnlinePackage(discovered);
    return {
      locale: 'ar-EG',
      mode: 'online',
      optimistic: true,
    };
  }

  private async resolveIosArabicLocale(): Promise<LocaleResolution | null> {
    try {
      const { locales, installedLocales } =
        await ExpoSpeechRecognitionModule.getSupportedLocales({});

      const onDeviceLocale = pickPreferredArabic(installedLocales);
      if (onDeviceLocale) {
        this.offlinePackAvailable = true;
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
    if (!this.locale || !this.mode) {
      this.errorListener?.('not_available', STT_UNAVAILABLE_AR);
      this.setListening(false);
      return;
    }

    const contextualStrings = getModelConfig().classes;
    const useOnDevice = this.mode === 'on_device';

    const startOptions: Parameters<typeof ExpoSpeechRecognitionModule.start>[0] = {
      lang: this.locale,
      interimResults: true,
      continuous: false,
      maxAlternatives: 1,
      contextualStrings,
    };

    if (useOnDevice) {
      startOptions.requiresOnDeviceRecognition = true;
      startOptions.addsPunctuation = true;
      startOptions.androidRecognitionServicePackage = ANDROID_ON_DEVICE_SERVICE;
    } else {
      const onlinePackage = getPreferredOnlinePackage(
        this.androidServicePackage
          ? [this.androidServicePackage, ...this.serviceCandidates]
          : this.serviceCandidates,
      );
      startOptions.androidRecognitionServicePackage = onlinePackage;
    }

    try {
      ExpoSpeechRecognitionModule.start(startOptions);
    } catch {
      if (this.fallbackFromOnDevice()) return;
      this.errorListener?.('recognition_error', STT_UNAVAILABLE_AR);
      this.setListening(false);
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

    this.startSub = ExpoSpeechRecognitionModule.addListener('start', () => {
      this.restarting = false;
    });

    this.endSub = ExpoSpeechRecognitionModule.addListener('end', () => {
      if (this.restarting) return;
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
    if (event.error === 'aborted') {
      return;
    }

    if (
      Platform.OS === 'android' &&
      this.mode === 'on_device' &&
      this.fallbackFromOnDevice()
    ) {
      return;
    }

    if (
      Platform.OS === 'android' &&
      this.mode === 'online' &&
      (event.error === 'service-not-allowed' || event.error === 'language-not-supported') &&
      this.tryNextServicePackage()
    ) {
      return;
    }

    const code = this.mapErrorCode(event.error);
    const message = this.mapErrorMessage(event);
    this.restarting = false;
    if (message) {
      this.errorListener?.(code, message);
    }
    this.setListening(false);
  }

  private restartRecognition(): void {
    this.restarting = true;
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch {
      // ignore
    }

    setTimeout(() => {
      if (!this.listening) {
        this.restarting = false;
        return;
      }
      this.beginRecognition();
    }, 200);
  }

  private fallbackFromOnDevice(): boolean {
    if (this.mode !== 'on_device') return false;

    this.mode = 'online';
    this.androidServicePackage = getPreferredOnlinePackage(this.serviceCandidates);

    this.restartRecognition();
    return true;
  }

  private tryNextServicePackage(): boolean {
    const onlineCandidates = buildAndroidOnlineCheckOrder(this.serviceCandidates);
    const currentIndex = onlineCandidates.indexOf(this.androidServicePackage ?? '');
    const nextIndex = currentIndex + 1;

    if (nextIndex >= onlineCandidates.length) return false;

    this.serviceCandidateIndex = nextIndex;
    this.androidServicePackage = onlineCandidates[nextIndex];
    this.restartRecognition();
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
}

export const sttService = new SttService();
