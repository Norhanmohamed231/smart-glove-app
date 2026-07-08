# العضو 03 — Binary Mode والنطق (TTS)

| الحقل | القيمة |
|-------|--------|
| **العضو** | _[اكتب الاسم]_ |
| **المحور** | التطبيق (Mobile) |
| **الدور** | وضع البتات الثنائي + القاموس + النطق الصوتي |

---

## المسؤولية باختصار

تحويل قيم **5 حساسات انحناء** إلى نمط من 5 بتات، البحث في **قاموس 32 كلمة عربية**، وإخراج النص مع **TTS**. يشمل أيضاً الإدخال اليدوي (Manual) وواجهة Binary Mode.

---

## المخرجات الرئيسية

- [ ] Binary Mode يعرض بتات حية من القفاز
- [ ] debounce 500ms قبل اعتماد الكلمة
- [ ] قاموس 32 كلمة + ترجمة إنجليزية
- [ ] TTS عربي عند نتيجة مستقرة
- [ ] وضع Manual للاختبار بدون قفاز

---

## الملفات التي تملكها

| الملف | الوظيفة |
|-------|---------|
| `src/features/binary/BinaryGestureProcessor.ts` | debounce + استقرار النمط |
| `src/features/binary/binarize.ts` | `flex >= 2000` → bit |
| `src/features/binary/constants.ts` | threshold، debounce، cooldown |
| `src/features/binary/defaultDictionary.ts` | 32 كلمة عربي/إنجليزي |
| `src/features/tts/TTSService.ts` | `expo-speech` |
| `src/screens/BinaryModeScreen.tsx` | واجهة المصفوفة |
| `src/hooks/useGlovePipeline.ts` | `useBinaryDisplay`, `useManualBinaryInput` |

---

## منطق العمل

```text
flex RAW → threshold 2000 → 5 bits → pattern (مثلاً 01011) → قاموس → عربي → TTS
```

ترتيب البتات: Thumb, Index, Middle, Ring, Pinky.

---

## الاعتماد على باقي الفريق

| يعتمد على | لماذا |
|-----------|--------|
| **02** | `GloveFrame.flex` صحيح |
| **06** | حساسات flex معايرة على القفاز |
| **01** | `GlovePipelineProvider` يوجّه النتائج |

---

## ما يقدّمه في العرض

1. فكرة Binary Mode (بسيط وسريع vs AI).
2. جدول أمثلة: `00000` = جاهز، `11111` = توقف.
3. شرح threshold ولماذا 2000 (وإمكانية الضبط).
4. Demo: تغيير وضع اليد → بتات → كلمة → نطق.
5. Manual mode للعرض بدون قفاز.

---

## سجل الإنجاز

| التاريخ | الإنجاز |
|---------|---------|
| | |

---

## روابط

- [04-binary-mode.md](../04-binary-mode.md)
- [06-hardware-flex-sensors.md](./06-hardware-flex-sensors.md)
