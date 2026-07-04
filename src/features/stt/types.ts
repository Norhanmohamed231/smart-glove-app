export type SttStatus = 'unchecked' | 'checking' | 'available' | 'unavailable';

/** on_device = offline pack installed; online = Google cloud (needs internet) */
export type SttMode = 'on_device' | 'online';

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
  mode: SttMode | null;
  errorMessage: string | null;
  infoMessage?: string | null;
}

export const STT_UNAVAILABLE_AR =
  'التعرف على الكلام العربي غير متاح على هذا الجهاز. تأكد من تثبيت Google وتفعيل الإنترنت.';

export const STT_NO_GOOGLE_AR =
  'لا توجد خدمة تعرف على الكلام على الجهاز. ثبّت تطبيق Google من Play Store ثم أعد المحاولة.';

export const STT_ONLINE_HINT_AR = 'وضع أونلاين — يحتاج إنترنت (بدون حزمة offline).';

export const STT_ONLINE_TRYING_AR =
  'سيتم التعرف عبر الإنترنت. تأكد من تثبيت Google وتفعيل المايك.';

export const STT_ON_DEVICE_HINT_AR = 'وضع على الجهاز — يعمل بدون إنترنت.';

export const STT_PERMISSION_DENIED_AR = 'يجب السماح باستخدام المايك للتعرف على الكلام.';

export const STT_NO_SPEECH_AR = 'لم يتم التقاط كلام. حاول مرة أخرى.';

export const STT_NETWORK_ERROR_AR = 'تحقق من الاتصال بالإنترنت وحاول مرة أخرى.';

export const STT_PACK_MISSING_AR =
  'حزمة العربية غير مثبتة. اضغط «تحميل الحزمة» أو استخدم الوضع الأونلاين.';

export const STT_PACK_DOWNLOADING_AR = 'جاري تحميل حزمة العربية... قد يطلب النظام تأكيداً.';

export const STT_PACK_DOWNLOAD_OK_AR = 'تم تحميل الحزمة. جرّب المايك الآن.';

export const STT_PACK_OPEN_SETTINGS_AR =
  'افتح إعدادات Google وحمّل Arabic من Offline speech recognition.';
