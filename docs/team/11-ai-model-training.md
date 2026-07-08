# العضو 11 — تدريب نموذج LSTM

| الحقل | القيمة |
|-------|--------|
| **العضو** | _[اكتب الاسم]_ |
| **المحور** | الذكاء الاصطناعي (AI) |
| **الدور** | بناء وتدريب وتقييم نموذج LSTM |

---

## المسؤولية باختصار

تحويل الـ dataset النظيف إلى **نموذج LSTM**، تجارب hyperparameters، تقييم (accuracy، confusion matrix)، واختيار أفضل نموذج لتسليمه للتصدير (**12**).

---

## المخرجات الرئيسية

- [ ] نموذج مدرب (`.h5` أو checkpoint)
- [ ] تقرير أداء: train/val accuracy
- [ ] Confusion matrix للفئات الـ 20
- [ ] توثيق معمارية النموذج (طبقات، hidden size، sequence length)
- [ ] ملفات scaler/preprocess متوافقة مع Mobile

---

## مواصفات مرجعية (التطبيق الحالي)

من `preprocessors.json`:

| البند | القيمة |
|-------|--------|
| `sequence_length` | 32 |
| `input_size` | 13 |
| `hidden_size` | 64 |
| `num_layers` | 2 |
| `feature_cols` | 5 flex + 6 IMU + pitch + roll |
| `confidence_threshold` | 0.35 |

---

## الاعتماد على باقي الفريق

| يتنسق مع | لماذا |
|----------|--------|
| **10** | dataset نظيف |
| **09** | تعريف الفئات |
| **12** | متطلبات التصدير ONNX |
| **04** | اختبار على الجهاز بعد التصدير |

---

## ما يقدّمه في العرض

1. معمارية LSTM (لماذا LSTM للسلاسل الزمنية).
2. منحنى التدريب (loss/accuracy).
3. أفضل النتائج وأضعف الفئات ولماذا.
4. Confusion matrix — أمثلة أخطاء شائعة.
5. مقارنة تجربتين (مثلاً hidden size أو window).

---

## سجل الإنجاز

| التاريخ | الإنجاز |
|---------|---------|
| | |

---

## روابط

- [05-ai-mode.md](../05-ai-mode.md)
- [10-ai-data-collection.md](./10-ai-data-collection.md)
- [12-ai-deployment-export.md](./12-ai-deployment-export.md)
