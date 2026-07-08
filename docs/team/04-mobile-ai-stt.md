# العضو 04 — AI Mode على الجهاز + Speak to Text

| الحقل | القيمة |
|-------|--------|
| **العضو** | _[اكتب الاسم]_ |
| **المحور** | التطبيق (Mobile) |
| **الدور** | تشغيل LSTM (ONNX) + تسجيل الإيماءات + STT |

---

## المسؤولية باختصار

كل ما يخص **AI Mode** على الموبايل: تسجيل الإطارات، preprocessing، استدلال ONNX، عرض الثقة، و**Speak to Text** العربي. التنسيق مع العضو **12** لملفات النموذج.

---

## المخرجات الرئيسية

- [ ] تحميل `sign_lstm.onnx` بنجاح على الجهاز
- [ ] Start/Stop recording يجمع إطارات ويعرض نتيجة
- [ ] 20 فئة عربية + «غير معروف» عند ثقة منخفضة
- [ ] STT يعمل (online أو offline)
- [ ] شاشة AI Mode كاملة

---

## الملفات التي تملكها

| الملف | الوظيفة |
|-------|---------|
| `src/features/ml/LSTMInferenceEngine.ts` | ONNX session + predict |
| `src/features/ml/LSTMGestureProcessor.ts` | تسجيل + توقيت |
| `src/features/ml/GestureCollector.ts` | جمع الإطارات |
| `src/features/ml/Preprocessor.ts` | smooth + resample + normalize |
| `src/features/ml/HybridFilter.ts` | فلتر المرشحين بالأصابع |
| `src/features/ml/frameToFeatures.ts` | 13 ميزة لكل إطار |
| `src/features/stt/SttService.ts` | التعرف على الكلام |
| `src/features/stt/SttPackInstaller.ts` | حزمة عربية offline |
| `src/screens/AiModeScreen.tsx` | واجهة AI + STT |
| `plugins/withOnnxRuntimePackage.js` | تسجيل ONNX native |
| `plugins/withSttPackInstaller.js` | وحدة تحميل الحزمة |
| `assets/models/*` | استلام من فريق AI (12) |

---

## تدفق AI Mode

```text
Start Recording → جمع frames → Stop → preprocess → ONNX → label + confidence → TTS
```

شكل التنسور: `[1, 32, 13]`.

---

## الاعتماد على باقي الفريق

| يعتمد على | لماذا |
|-----------|--------|
| **12** | ONNX + preprocessors + signatures |
| **02** | إطارات صحيحة من القفاز |
| **11** | نموذج مدرب على نفس شكل البيانات |
| **01** | تحميل النموذج عند الإقلاع |

---

## ما يقدّمه في العرض

1. الفرق بين Binary (قاموس) و AI (تعلم آلي).
2. الـ 20 إشارة المدعومة (من `preprocessors.json`).
3. خطوات preprocessing قبل ONNX.
4. Hybrid filter باختصار.
5. Demo: تسجيل إيماءة → كلمة + نسبة ثقة.
6. STT: مايك → نص عربي (اختياري مختصر).

---

## سجل الإنجاز

| التاريخ | الإنجاز |
|---------|---------|
| | |

---

## روابط

- [05-ai-mode.md](../05-ai-mode.md)
- [06-stt.md](../06-stt.md)
- [12-ai-deployment-export.md](./12-ai-deployment-export.md)
