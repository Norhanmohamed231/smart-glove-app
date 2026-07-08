# العضو 02 — Bluetooth وبروتوكول البيانات (Parser)

| الحقل | القيمة |
|-------|--------|
| **العضو** | _[اكتب الاسم]_ |
| **المحور** | التطبيق (Mobile) |
| **الدور** | استقبال بيانات القفاز وتحويلها إلى إطارات (frames) |

---

## المسؤولية باختصار

كل ما يخص **الاتصال Bluetooth Classic** مع `SignGlove` و**تحليل** سطور CSV القادمة من الـ firmware إلى `GloveFrame` يمر عبر مسؤوليتك.

---

## المخرجات الرئيسية

- [ ] اتصال ناجح من التطبيق بعد Pairing في Android
- [ ] Parser يحوّل سطور `DATA,...` إلى 14 حقل رقمي
- [ ] دعم نهاية السطر `\r` و `\n`
- [ ] مسح الأجهزة وفلترة `SignGlove` / `esp32`
- [ ] توثيق البروتوكول مع العضو **08**

---

## الملفات التي تملكها

| الملف | الوظيفة |
|-------|---------|
| `src/features/bluetooth/BluetoothService.ts` | اتصال، مسح، `delimiter: '\r'` |
| `src/features/bluetooth/bluetoothPermissions.ts` | صلاحيات Android 12+ |
| `src/features/bluetooth/constants.ts` | `GLOVE_DEVICE_NAME` |
| `src/features/parser/GloveDataParser.ts` | تقسيم CSV → `GloveFrame` |
| `src/features/parser/types.ts` | تعريف `GloveFrame` |
| `src/features/pipeline/GloveFrameStream.ts` | بث الإطارات للـ pipeline |
| `src/components/DeviceScanModal.tsx` | واجهة المسح والاتصال |

---

## عقد البيانات (مع العضو 08)

```text
DATA,<timestamp>,<f1>,<f2>,<f3>,<f4>,<f5>,<ax>,<ay>,<az>,<gx>,<gy>,<gz>,<pitch>,<roll>\r
```

- 14 رقماً بعد timestamp
- Flex: RAW 0–4095
- IMU: g و °/s

---

## الاعتماد على باقي الفريق

| يعتمد على | لماذا |
|-----------|--------|
| **08** | إرسال CSV صحيح على BT |
| **01** | دمج الـ stream في الـ pipeline |

---

## ما يقدّمه في العرض

1. لماذا Bluetooth Classic وليس BLE (توافق firmware).
2. مسار البيانات: `onDataReceived` → `pushChunk` → `emit(frame)`.
3. مشكلة `\r` vs `\n` وكيف حُلّت.
4. عرض: DeviceScanModal + إطار parsed واحد (قيم flex/IMU).
5. صلاحيات Android المطلوبة.

---

## سجل الإنجاز

| التاريخ | الإنجاز |
|---------|---------|
| | |

---

## روابط

- [03-glove-firmware.md](../03-glove-firmware.md)
- [08-hardware-firmware-bt.md](./08-hardware-firmware-bt.md)
- [08-troubleshooting.md](../08-troubleshooting.md)
