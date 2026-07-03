export type SttStatus = 'unchecked' | 'checking' | 'available' | 'unavailable';

export type SttErrorCode =
  | 'permission_denied'
  | 'on_device_unsupported'
  | 'arabic_not_installed'
  | 'not_available'
  | 'no_speech'
  | 'recognition_error'
  | 'aborted';

export interface SttResult {
  arabic: string;
  confidence: number;
  isFinal: boolean;
}

export interface SttAvailability {
  status: SttStatus;
  locale: string | null;
  errorMessage: string | null;
}

export const STT_UNAVAILABLE_AR =
  'ثبّت حزمة التعرف على الكلام العربي من إعدادات Google (Offline speech recognition).';

export const STT_PERMISSION_DENIED_AR = 'يجب السماح باستخدام المايك للتعرف على الكلام.';

export const STT_NO_SPEECH_AR = 'لم يتم التقاط كلام. حاول مرة أخرى.';
