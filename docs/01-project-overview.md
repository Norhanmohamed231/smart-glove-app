# نظرة عامة على المشروع

## ما هو signTalker؟

**signTalker** تطبيق موبايل (Android) مرافق لقفاز **SignGlove** الذكي. يستقبل بيانات الحساسات عبر **Bluetooth Classic**، يحوّل وضعية الأصابع إلى إشارات، ويعرض نصاً عربياً مع نطق صوتي (TTS).

| البند | القيمة |
|-------|--------|
| الاسم | signTalker |
| الحزمة | `com.signtalker.app` |
| الإطار | Expo SDK 54 · React Native 0.81 · TypeScript |
| المنصة المدعومة للقفاز | **Android فقط** (Bluetooth Classic) |
| اسم الجهاز على Bluetooth | `SignGlove` |

---

## المشكلة التي يحلها المشروع

التواصل بين شخص يستخدم لغة الإشارة (عبر القفاز) والمحيط يحتاج وسيطاً يفهم وضعية الأصابع ويحوّلها لكلمات مفهومة. signTalker يوفر مسارين:

1. **Binary Mode** — سريع وبسيط: كل إصبع = 0 أو 1 → 32 كلمة عربية جاهزة.
2. **AI Mode** — أذكى: يسجّل حركة الإيماءة ويصنّفها عبر نموذج LSTM مدرب على 20 إشارة عربية.

إضافة **Speak to Text** للتعرف على الكلام العربي من المايك (مكمّل، ليس بديلاً للقفاز).

---

## حالة الميزات (يوليو 2026)

| الميزة | الحالة | ملاحظات |
|--------|--------|---------|
| الشاشة الرئيسية والتنقل | ✅ | Expo Router |
| Bluetooth Classic + Pairing | ✅ | `react-native-bluetooth-classic` |
| Parser بيانات القفاز | ✅ | 14 حقل، يدعم `\r` و `\n` |
| Binary Mode | ✅ | قاموس 32 كلمة + TTS |
| إدخال يدوي (Manual) | ✅ | بدون قفاز |
| AI Mode (ONNX LSTM) | ✅ | 20 فئة، تسجيل Start/Stop |
| Speak to Text | ✅ | عربي أونلاين / offline |
| History | ✅ | AsyncStorage |
| مستوى البطارية | ⚠️ | قيمة وهمية في الواجهة |
| BLE | 🔜 | مخطط لمرحلة لاحقة |

---

## شاشات التطبيق

| الشاشة | المسار | الوظيفة |
|--------|--------|---------|
| Splash | `/` | شاشة البداية |
| Home | `/home` | حالة الاتصال، بدء الترجمة |
| Choose Mode | `/choose-mode` | اختيار Binary أو AI |
| Binary Mode | `/binary-mode` | مصفوفة البتات + القفاز/يدوي |
| AI Mode | `/ai-mode` | تسجيل إيماءة + STT |
| History | `/history` | سجل الكلمات |

---

## سير العمل النموذجي

```text
1. شغّل القفاز (ESP32) وانتظر شاشة READY على OLED
2. اربط SignGlove من إعدادات Bluetooth في Android
3. افتح signTalker → Scan & Connect
4. اختر Binary أو AI
5. نفّذ الإيماءة → اقرأ النص العربي → استمع للنطق
```

---

## هيكل المجلدات (مختصر)

```text
signbridge-app/
├── app/                 # مسارات Expo Router
├── src/
│   ├── features/
│   │   ├── bluetooth/   # اتصال القفاز
│   │   ├── parser/      # تحليل CSV
│   │   ├── binary/      # وضع البتات
│   │   ├── ml/          # ONNX LSTM
│   │   ├── stt/         # التعرف على الكلام
│   │   ├── pipeline/    # توجيه الإطارات
│   │   └── tts/         # النطق
│   ├── screens/         # واجهات الشاشات
│   ├── store/           # Zustand
│   └── providers/       # GlovePipelineProvider
├── assets/models/       # ONNX + preprocessors
├── plugins/             # Expo config plugins
└── docs/                # هذه الوثائق
```

---

## ما ليس ضمن هذا المستودع

- **Firmware ESP32** — عادة في مستودع أو ملف `.ino` منفصل
- **تدريب نموذج LSTM** — Python / Jupyter (يُصدَّر إلى `sign_lstm.onnx`)
- **Expo Go** — لا يدعم Bluetooth Classic ولا ONNX؛ استخدم dev build أو APK

---

## الخطوة التالية

- [التثبيت وبناء APK](./02-setup-and-build.md)
- [دليل القفاز](./03-glove-firmware.md)
