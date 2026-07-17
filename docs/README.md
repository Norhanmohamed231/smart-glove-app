# signTalker — فهرس الوثائق

وثائق تفصيلية لمشروع **signTalker**: تطبيق Android يربط قفاز SignGlove الذكي ويترجم الإيماءات إلى عبارات عربية.

---

## للبدء السريع

| الملف | المحتوى |
|-------|---------|
| [نظرة عامة على المشروع](./01-project-overview.md) | الهدف، الميزات، حالة التطوير |
| [التثبيت وبناء APK](./02-setup-and-build.md) | متطلبات، تشغيل، بناء release للفريق |
| [دليل القفاز والـ Firmware](./03-glove-firmware.md) | الاتصال، تنسيق البيانات، المعايرة |

---

## الأوضاع والميزات

| الملف | المحتوى |
|-------|---------|
| [Binary Mode](./04-binary-mode.md) | 5 بت من حساسات الانحناء → قاموس عربي |
| [Binary Dictionary Customization](./09-binary-dictionary-customization.md) | تخصيص القاموس + 32 illustration |
| [AI Mode](./05-ai-mode.md) | تسجيل الإيماءة + LSTM ONNX |
| [Speak to Text (STT)](./06-stt.md) | التعرف على الكلام العربي |

---

## للمطورين

| الملف | المحتوى |
|-------|---------|
| [البنية المعمارية](./07-architecture.md) | طبقات التطبيق، تدفق البيانات، الملفات الرئيسية |
| [استكشاف الأخطاء](./08-troubleshooting.md) | مشاكل شائعة وحلولها |

---

## فريق التخرج (12 فرد)

| الملف | المحتوى |
|-------|---------|
| [TEAM_DIVISION.md](./TEAM_DIVISION.md) | التقسيمة العامة — 3 محاور × 4 أفراد |
| [team/README.md](./team/README.md) | ملف تفصيلي لكل عضو (01–12) |

---

## مرجع إضافي

- [ARCHITECTURE_REFERENCE.md](./ARCHITECTURE_REFERENCE.md) — وثيقة مرجعية أولية (إنجليزي، قديمة جزئياً)
- [README.md](../README.md) — ملخص المشروع بالإنجليزية

---

## مخطط تدفق البيانات (مختصر)

```text
ESP32 (SignGlove)
    │  Bluetooth Classic SPP
    │  سطر CSV ينتهي بـ \r
    ▼
BluetoothService  →  GloveDataParser  →  gloveFrameStream
    ▼
GesturePipelineRouter
    ├── Binary Mode  → قاموس 32 كلمة
    └── AI Mode      → ONNX LSTM (20 إشارة)
    ▼
Zustand Store  →  الشاشات + TTS + History
```

---

**آخر تحديث:** يوليو 2026
