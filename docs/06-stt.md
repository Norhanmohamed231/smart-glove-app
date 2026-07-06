# Speak to Text (STT)

## الفكرة

تحويل الكلام العربي المنطوق عبر المايك إلى نص، مع إضافة النتيجة إلى **History** بمصدر **Speech**.

متاح في **AI Mode** و **Binary Mode** عبر بطاقة **Speak to Text**.

---

## المتطلبات

| البند | التفاصيل |
|-------|----------|
| المنصة | Android (أساسي) |
| صلاحية | `RECORD_AUDIO` |
| Google app | مطلوب لمعظم الأجهزة |
| الإنترنت | للوضع **أونلاين** (بدون حزمة offline) |
| حزمة offline | اختيارية — Arabic من إعدادات Google Voice |

---

## أوضاع التعرف

| الوضع | الوصف |
|-------|--------|
| `online` | تعرف عبر Google Cloud — يحتاج إنترنت |
| `on_device` | حزمة العربية مثبتة على الجهاز — يعمل بدون نت |

التطبيق يختار تلقائياً: يفضّل **on_device** إن وُجدت الحزمة، وإلا **online**.

---

## طريقة الاستخدام

1. امنح صلاحية المايك عند الطلب
2. اضغط أيقونة **المايك** للبدء
3. تكلّم بالعربية
4. اضغط مرة أخرى للإيقاف
5. يظهر النص + Accuracy؛ الإدخال النهائي يُحفظ في History

### تحميل حزمة العربية (Offline)

إذا ظهر زر **«تحميل حزمة العربية»**:

1. اضغط الزر
2. قد يفتح النظام حوار تحميل (Android 13+)
3. أو تُفتح إعدادات Google Voice — اختر **Offline speech recognition → Arabic**
4. ارجع للتطبيق — يُعاد فحص التوفر تلقائياً

---

## اللغات المفضلة

```text
ar-EG (مصري) ثم ar-SA (سعودي)
```

---

## خدمات التعرف على Android

`SttService` يبحث عن خدمات متعددة بالترتيب:

1. الخدمة الافتراضية للنظام
2. خدمة المساعد
3. كل الخدمات من `getSpeechRecognitionServices()`
4. `com.google.android.googlequicksearchbox`
5. `com.google.android.as`

عند فشل خدمة، يُجرّب التالية تلقائياً.

---

## رسائل الخطأ الشائعة

| الرسالة | المعنى |
|---------|--------|
| التعرف غير متاح | لا خدمة STT أو لا دعم للعربية |
| لا توجد خدمة — ثبّت Google | الجهاز بدون Google (بعض Huawei) |
| تحقق من الإنترنت | وضع online بدون اتصال |
| يجب السماح بالمايك | صلاحية مرفوضة |
| لم يتم التقاط كلام | صمت أو مدة قصيرة جداً |

---

## التكامل مع AI Mode

`contextualStrings` في `SttService.startListening()` تُمرَّر من فئات نموذج LSTM (`preprocessors.json` → `classes`) لتحسين التعرف على كلمات الإشارات.

---

## الملفات الرئيسية

```text
src/features/stt/SttService.ts
src/features/stt/SttPackInstaller.ts
src/features/stt/types.ts
src/hooks/useStt.ts
src/components/SpeakToTextCard.tsx
plugins/withSttPackInstaller.js
android/.../stt/SttPackInstallerModule.kt
```

---

## Plugin و Native

`expo-speech-recognition` في `app.json` مع:

- صلاحيات المايك والتعرف على الكلام
- `androidSpeechServicePackages` لـ Google

`withSttPackInstaller.js` يضيف وحدة React Native لتحميل حزمة العربية على Android 13+.

---

## الخطوة التالية

- [البنية المعمارية](./07-architecture.md)
- [استكشاف الأخطاء](./08-troubleshooting.md)
