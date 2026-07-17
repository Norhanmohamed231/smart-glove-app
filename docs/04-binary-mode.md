# Binary Mode

## الفكرة

كل إصبع من الخمسة يُحوَّل إلى **بت واحد**:

- `0` — الإصبع مفرود (قيمة flex منخفضة نسبياً)
- `1` — الإصبع مثني (قيمة flex عالية نسبياً)

النمط من 5 بتات (مثلاً `01011`) يُبحث عنه في **قاموس** من 32 كلمة عربية (`2^5 = 32`).

```text
القفاز → flex RAW → threshold → 5 bits → قاموس → عبارة عربية → TTS
```

---

## طريقة الاستخدام

1. اتصل بالقفاز من الشاشة الرئيسية
2. **Choose Mode → Binary Mode**
3. اختر مصدر الإدخال:
   - **Glove** — بتات حية من الحساسات (يتطلب اتصالاً)
   - **Manual** — اضغط على دوائر الأصابع لتبديل 0/1 يدوياً
4. ثبّت وضعية اليد ~**نصف ثانية** (debounce) حتى تُعرض الكلمة بثبات
5. اضغط **Speak** لإعادة النطق أو انسخ الترجمة الإنجليزية

---

## قواعد التحويل إلى بتات

الكود في `src/features/binary/binarize.ts`:

```text
flex >= FLEX_THRESHOLD  →  bit = 1
flex <  FLEX_THRESHOLD  →  bit = 0
```

| الثابت | القيمة | الملف |
|--------|--------|-------|
| `FLEX_THRESHOLD` | **2000** | `src/features/binary/constants.ts` |
| `DEBOUNCE_MS` | **500** | نفس الملف |
| `TTS_COOLDOWN_MS` | **2000** | منع تكرار النطق |

ترتيب البتات: **Thumb, Index, Middle, Ring, Pinky** (من اليسار لليمين في الواجهة).

---

## القاموس (32 كلمة)

معرّف في `src/features/binary/defaultDictionary.ts`.

| النمط | العربية | النمط | العربية |
|-------|---------|-------|---------|
| 00000 | جاهز | 10000 | ماء |
| 00001 | مرحبا | 10001 | طعام |
| 00010 | شكرا | … | … |
| 00011 | نعم | 11111 | توقف |
| 00100 | لا | | |

نمط غير موجود → **«غير معرّف»** (`UNKNOWN_PATTERN`).

---

## Debounce والاستقرار

`BinaryGestureProcessor` لا يُصدِر كلمة جديدة إلا إذا:

1. بقي النمط ثابتاً لمدة **500 ms**
2. اختلف عن آخر نمط مُصدَر

هذا يمنع الوميض بين كلمتين عند اهتزاز الحساس.

---

## Speak to Text في Binary Mode

بطاقة **Speak to Text** في أسفل الشاشة — مستقلة عن القفاز:

- تسجيل صوت عربي → نص → يُضاف للـ History
- لا تؤثر على مصفوفة البتات

---

## ضبط الدقة

### إذا كانت كل البتات 0 أو 1 دائماً

- راجع قيم flex في الاتصال (هل الحساسات موصولة؟)
- عدّل `FLEX_THRESHOLD` في `constants.ts`
- أو استخدم thresholds لكل إصبع من `assets/models/preprocessors.json` → `finger_thresholds` (تحسين مقترح)

### إذا كانت الأنماط معكوسة

قد تحتاج عكس منطق `flexToBit` حسب توصيل الحساسات (مفتوح = قيمة عالية أو منخفضة).

### الوضع اليدوي للاختبار

بدون قفاز: **Manual** → جرّب نمط `00011` (نعم) للتأكد من القاموس و TTS.

---

## تخصيص القاموس (Customize Dictionary)

من **Binary Mode** → **Customize Dictionary**:

1. اختر أي pattern من الـ 32 — مع **illustration** لشكل الإشارة
2. عدّل **العبارة العربية** (كلمة أو جملة كاملة)
3. عدّل **English translation** (اختياري — للعرض والنسخ)
4. **Test Speech** ينطق العربي
5. **Reset** يرجّع entry واحد للافتراضي، أو **Reset All** للكل

التخصيص يُحفظ في AsyncStorage (`@signtalker/binary-dictionary`) ويُحمَّل عند فتح التطبيق.

| Pattern | illustration |
|---------|--------------|
| `01011` | `assets/binary-gestures/01011.svg` |

وثيقة كاملة: [09-binary-dictionary-customization.md](./09-binary-dictionary-customization.md)

---

## الملفات الرئيسية

```text
src/features/binary/BinaryGestureProcessor.ts
src/features/binary/BinaryDictionaryStore.ts
src/features/binary/gestureIllustrations.ts
src/features/binary/binarize.ts
src/features/binary/constants.ts
src/features/binary/defaultDictionary.ts
src/screens/BinaryModeScreen.tsx
src/screens/BinaryDictionaryScreen.tsx
src/hooks/useGlovePipeline.ts      # useBinaryDisplay, useManualBinaryInput
```

---

## الخطوة التالية

- [AI Mode](./05-ai-mode.md)
- [استكشاف الأخطاء](./08-troubleshooting.md)
