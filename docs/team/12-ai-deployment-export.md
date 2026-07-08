# العضو 12 — التصدير للموبايل (ONNX) ونشر النموذج

| الحقل | القيمة |
|-------|--------|
| **العضو** | _[اكتب الاسم]_ |
| **المحور** | الذكاء الاصطناعي (AI) |
| **الدور** | تصدير النموذج + ملفات التطبيق + Hybrid filter |
| **Sub-lead** | نعم (محور AI) |

---

## المسؤولية باختصار

تحويل النموذج المدرب إلى **`sign_lstm.onnx`** وإنتاج **`preprocessors.json`** و **`word_signatures.json`** ووضعها في `assets/models/` بالتطبيق. ضمان تطابق preprocessing بين Python والموبايل. نقطة الربط مع **04**.

---

## المخرجات الرئيسية

- [ ] `sign_lstm.onnx` يعمل في `LSTMInferenceEngine`
- [ ] `preprocessors.json` (scaler_mean, scaler_scale, classes, finger_thresholds)
- [ ] `word_signatures.json` لـ `HybridFilter`
- [ ] تقرير: دقة على الجهاز vs على الحاسوب
- [ ] إجراء تحديث نموذج (versioning) موثّق

---

## الملفات في التطبيق

```text
assets/models/
├── sign_lstm.onnx
├── preprocessors.json
└── word_signatures.json
```

يستهلكها:

- `src/features/ml/LSTMInferenceEngine.ts`
- `src/features/ml/Preprocessor.ts`
- `src/features/ml/HybridFilter.ts`
- `src/features/ml/modelAssets.ts`

---

## خطوات التصدير (مرجعية)

1. تطبيق نفس preprocessing كـ `Preprocessor.ts` (smooth 3 → resample 32 → normalize).
2. تصدير ONNX بمدخل `[1, 32, 13]` ومخرج logits.
3. توليد `finger_thresholds` و signatures من بيانات التدريب.
4. اختبار على APK مع **04**.
5. توثيق أي تغيير في الفئات أو العتبات.

---

## الاعتماد على باقي الفريق

| يتنسق مع | لماذا |
|----------|--------|
| **11** | أوزان النموذج النهائية |
| **04** | ONNX runtime + plugins |
| **02** | شكل الإطارات الحية = شكل التدريب |
| **01** | إصدار APK يضم assets محدثة |

---

## ما يقدّمه في العرض

1. لماذا ONNX + onnxruntime-react-native.
2. مخطط: Python model → ONNX → mobile inference.
3. محتوى `preprocessors.json` (بدون أرقام كلها — مثال).
4. Hybrid filter: تقييد المرشحين بأنماط الأصابع.
5. Demo: نفس إيماءة على الحاسوب vs الهاتف (ثقة قريبة).

---

## سجل الإنجاز

| التاريخ | الإنجاز |
|---------|---------|
| | |

---

## روابط

- [05-ai-mode.md](../05-ai-mode.md)
- [04-mobile-ai-stt.md](./04-mobile-ai-stt.md)
- [07-architecture.md](../07-architecture.md)
- [TEAM_DIVISION.md](../TEAM_DIVISION.md)
