# AI Mode

## الفكرة

بدلاً من 32 كلمة ثابتة، يصنّف **AI Mode** الإيماءة ضمن **20 إشارة عربية** مدربة على نموذج **LSTM** يعمل على الجهاز عبر **ONNX Runtime**.

```text
تسجيل إطارات أثناء الإيماءة → preprocessing → ONNX → كلمة + ثقة → TTS + History
```

---

## طريقة الاستخدام

1. اتصل بالقفاز
2. **Choose Mode → AI Mode**
3. انتظر **AI model loading…** حتى يصبح جاهزاً
4. اضغط **Start Recording**
5. نفّذ الإيماءة (~**1–2 ثانية**)
6. اضغط **Stop Recording**
7. انتظر **Recognizing sign…** ثم اعرض الكلمة والثقة

> AI Mode **ليس تلقائياً** — يجب الضغط على Start/Stop في كل إيماءة.

---

## الإشارات المدعومة (20 فئة)

من `assets/models/preprocessors.json`:

| | | | |
|--|--|--|--|
| إنت | اسكت | اسمي | اكل |
| الافضل | السلام عليكم | انا | بحبك |
| تعبان | زعلان | سهل | شكرا |
| عاوز | قوي | كريم | كليه الهندسه |
| لأ | لو سمحت | مسؤول | نعم |

إذا كانت الثقة أقل من **0.35** → يُعرض **«غير معروف»**.

---

## مدخلات النموذج

كل إطار (frame) يُحوَّل إلى **13 ميزة** (`src/features/ml/frameToFeatures.ts`):

```text
flex_thumb, flex_index, flex_middle, flex_ring, flex_pinky,
ax, ay, az, gx, gy, gz, pitch, roll
```

### Preprocessing (`Preprocessor.ts`)

1. **تنعيم** — `smooth_window: 3`
2. **إعادة أخذ عينات** — إلى طول **32** إطار (`resample_target`)
3. **تطبيع** — `scaler_mean` و `scaler_scale` من `preprocessors.json`

الشكل النهائي للتنسور: `[1, 32, 13]`

---

## Hybrid Filter

قبل اختيار أعلى احتمال، `HybridFilter` يقيّد المرشحين بمقارنة **نمط الأصابع** (متوسط flex مقابل `finger_thresholds`) مع `word_signatures.json`.

هذا يقلل أخطاء التصنيف بين إشارات متشابهة.

---

## حالات التسجيل

| الحالة | الوصف |
|--------|--------|
| `idle` | جاهز للتسجيل |
| `collecting` | يجمع الإطارات من القفاز |
| `predicting` | ONNX يعمل |

الحد الأدنى للإطارات عند الإيقاف: **5** (`GestureCollector`). أقل من ذلك → لا نتيجة.

عند 20 Hz من القفاز: تسجيل 1.5 ثانية ≈ 30 إطار (مثالي).

---

## أصول النموذج

| الملف | الوظيفة |
|-------|---------|
| `assets/models/sign_lstm.onnx` | النموذج |
| `assets/models/preprocessors.json` | scaler، فئات، thresholds |
| `assets/models/word_signatures.json` | أنماط أصابع للفلتر الهجين |

يُنسخ ONNX إلى `documentDirectory` عند أول تحميل (`LSTMInferenceEngine.ts`).

---

## ONNX و Native Build

يتطلب:

- `onnxruntime-react-native` في `app.json`
- `plugins/withOnnxRuntimePackage.js` لتسجيل الحزمة في `MainApplication.kt`

بعد أي تغيير native:

```bash
npm run prebuild:android
npm run apk:team
```

---

## Speak to Text

نفس بطاقة STT في أسفل الشاشة — تُضيف مدخلات صوتية للـ History بمصدر **Speech**.

---

## الملفات الرئيسية

```text
src/features/ml/LSTMInferenceEngine.ts
src/features/ml/LSTMGestureProcessor.ts
src/features/ml/GestureCollector.ts
src/features/ml/Preprocessor.ts
src/features/ml/HybridFilter.ts
src/features/ml/frameToFeatures.ts
src/screens/AiModeScreen.tsx
src/providers/GlovePipelineProvider.tsx
```

---

## نصائح لدقة أفضل

- سجّل في بيئة هادئة مع يد ثابتة
- لا تحرك اليد قبل Start أو بعد Stop مباشرة
- تأكد أن flex و IMU يتغيران أثناء التسجيل (اتصال القفاز سليم)
- درّب النموذج على بيانات من **نفس القفاز** ونفس تنسيق CSV

---

## الخطوة التالية

- [Speak to Text](./06-stt.md)
- [البنية المعمارية](./07-architecture.md)
