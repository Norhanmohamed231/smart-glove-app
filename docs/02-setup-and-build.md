# التثبيت وبناء APK

## المتطلبات

| الأداة | الإصدار / الملاحظات |
|--------|---------------------|
| Node.js | 18 أو أحدث |
| npm | يأتي مع Node |
| Android Studio | SDK + Build Tools |
| JDK | 17 (عادةً مع Android Studio) |
| جهاز Android حقيقي | للقفاز و STT (المحاكي x86 محدود) |

تأكد من ضبط `ANDROID_HOME` أو تثبيت SDK من Android Studio.

---

## 1. تثبيت الاعتماديات

```bash
cd signbridge-app
npm install
```

---

## 2. تشغيل نسخة التطوير (Debug)

```bash
npm run android
```

يشغّل `expo run:android` ويبني مشروع `android/` ويثبّت على الجهاز/المحاكي.

> **مهم:** Bluetooth Classic والقفاز يعملان على **جهاز Android حقيقي** بمعمارية ARM. المحاكي x86 مناسب لواجهة التطبيق فقط.

### بعد تغيير إعدادات native

إذا عدّلت `app.json` أو الـ plugins (`withOnnxRuntimePackage.js`, `withSttPackInstaller.js`):

```bash
npm run prebuild:android
npm run android
```

---

## 3. بناء APK للفريق (موصى به)

```bash
npm run apk:team
```

| البند | التفاصيل |
|-------|----------|
| الأمر الداخلي | `gradlew assembleRelease` مع `armeabi-v7a` و `arm64-v8a` فقط |
| الحجم التقريبي | ~93 MB |
| مكان الملف | `android/app/build/outputs/apk/release/app-release.apk` |
| المحاكي x86 | **لا يعمل** — APK مخصص لأجهزة حقيقية |

### بناء release كامل (كل المعماريات)

```bash
npm run android:apk
```

حجم أكبر؛ استخدمه فقط إذا احتجت دعم معماريات إضافية.

---

## 4. توزيع APK على الفريق

1. **احذف** أي نسخة قديمة من signTalker من الهاتف
2. انقل `app-release.apk` (USB، Drive، Telegram، …)
3. فعّل **Install from unknown sources** إن لزم
4. ثبّت التطبيق
5. امنح الصلاحيات: **Bluetooth**، **Location** (للمسح)، **Microphone** (لـ STT)
6. اربط **SignGlove** من إعدادات Bluetooth **قبل** فتح التطبيق

---

## 5. سكربتات npm

| السكربت | الوظيفة |
|---------|----------|
| `npm start` | Metro / Expo dev server |
| `npm run android` | بناء وتشغيل debug على Android |
| `npm run apk:team` | APK release للفريق (ARM فقط) |
| `npm run android:apk` | APK release كامل |
| `npm run prebuild:android` | إعادة توليد مجلد `android/` |
| `npm run lint` | ESLint |

---

## 6. Plugins مخصصة (native)

| الملف | السبب |
|-------|--------|
| `plugins/withOnnxRuntimePackage.js` | تسجيل `OnnxruntimePackage` في MainApplication (ONNX لا يُربط تلقائياً عبر Expo) |
| `plugins/withSttPackInstaller.js` | وحدة native لتحميل حزمة العربية offline |

بعد تعديل أي plugin شغّل `prebuild:android` ثم أعد البناء.

---

## 7. أخطاء البناء الشائعة

| الخطأ | الحل |
|-------|------|
| `Unable to delete app-release.apk` | أغلق الملف من Explorer أو أي برنامج فاتحه، ثم أعد `npm run apk:team` |
| `libreactnative.so not found` على المحاكي | طبيعي مع APK الـ ARM — استخدم جهازاً حقيقياً أو `npm run android` |
| ONNX crash عند التشغيل | تأكد من plugin ONNX + `prebuild` |
| `BUILD FAILED` بعد تحديث Expo | `npm install` ثم `expo install --fix` |

---

## الخطوة التالية

- [دليل القفاز والـ Firmware](./03-glove-firmware.md)
