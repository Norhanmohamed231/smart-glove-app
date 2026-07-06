# دليل القفاز والـ Firmware

## العتاد

| المكوّن | التفاصيل |
|---------|----------|
| المتحكم | ESP32 |
| حساسات الانحناء | 5 (Thumb → Pinky) |
| IMU | MPU6050 (تسارع + جيروسكوب) |
| الشاشة | OLED SSD1306 (اختياري) |
| الاتصال | Bluetooth Classic — اسم الجهاز **`SignGlove`** |

### ترتيب دبابيس Flex (من الـ firmware)

```text
Thumb=35, Index=32, Middle=33, Ring=25, Pinky=26
```

---

## الاتصال من التطبيق

### 1. على مستوى Android (إلزامي)

1. شغّل القفاز وانتظر انتهاء المعايرة (شاشة OLED: **READY**)
2. **Settings → Bluetooth → Pair** مع `SignGlove`
3. افتح signTalker → اضغط بطاقة **Glove Status** → **Scan**
4. اختر الجهاز من القائمة → **Connect**

### 2. صلاحيات التطبيق

- Bluetooth Connect / Scan (Android 12+)
- Location (مطلوب لاكتشاف الأجهزة على Android)
- يُفضّل منحها عند أول طلب

### 3. فلترة الأجهزة في التطبيق

`BluetoothService` يعرض أجهزة اسمها يحتوي: `signglove`، `sign`، أو `esp32`.

---

## تنسيق البيانات (CSV)

### سطر واحد لكل إطار (frame)

البادئة الموصى بها من الـ firmware الحالي:

```text
DATA,<timestamp>,<f1>,<f2>,<f3>,<f4>,<f5>,<ax>,<ay>,<az>,<gx>,<gy>,<gz>,<pitch>,<roll>
```

**14 رقماً بعد الـ timestamp** (إجمالي 15 حقل بعد `DATA`):

| # | الحقل | الوحدة / النطاق |
|---|--------|-----------------|
| 1 | timestamp | ms من `millis()` |
| 2–6 | flex thumb … pinky | RAW ADC **0–4095** |
| 7–9 | ax, ay, az | **g** (جاذبية) |
| 10–12 | gx, gy, gz | **°/s** |
| 13–14 | pitch, roll | درجات |

### مثال حقيقي

```text
DATA,28878,1280,1071,1894,2528,1498,-0.003,-0.002,0.972,-1.06,-0.10,-0.21,-1.28,0.04
```

### نهاية السطر (مهم جداً)

ESP32 `BluetoothSerial` غالباً ينهي السطر بـ **`\r` فقط** (بدون `\n`).

التطبيق مضبوط على:

- **Delimiter Bluetooth:** `\r`
- **Parser:** يقسم على `\r\n` أو `\n` أو `\r`

لو غيّرت الـ firmware لإرسال `\n` فقط، يظل التطبيق متوافقاً.

### معدل الإرسال

| البند | القيمة |
|-------|--------|
| SAMPLE_RATE_MS | 50 ms |
| التردد | **20 Hz** |
| الإرسال على BT | فقط عند `SerialBT.hasClient()` |

---

## المعايرة على القفاز (عند الإقلاع)

1. **MPU6050** — اليد ثابتة على سطح مستوٍ (~ثوانٍ)
2. **Flex** — اليد مفتوحة بالكامل (~3 ثوانٍ) → يُحفظ `flexMin` لكل إصبع، `flexMax = 4095`

خلال المعايرة قد تظهر رسائل `[CAL]` على **Serial USB** فقط — لا تُرسل عادةً على Bluetooth.

---

## التوافق مع التطبيق

| جانب | Firmware | التطبيق | متوافق؟ |
|------|----------|---------|---------|
| اسم BT | SignGlove | `GLOVE_DEVICE_NAME` | ✅ |
| البادئة | `DATA,` | `GloveDataParser` يزيلها | ✅ |
| عدد الحقول | 14 بعد timestamp | `EXPECTED_FIELDS = 14` | ✅ |
| Flex RAW | 0–4095 | LSTM scaler + Binary threshold | ✅ |
| نهاية السطر | `\r` | `delimiter: '\r'` | ✅ |

### ملفات التطبيق ذات الصلة

```text
src/features/bluetooth/BluetoothService.ts   # الاتصال + delimiter
src/features/bluetooth/constants.ts          # SignGlove
src/features/parser/GloveDataParser.ts      # تحليل CSV
```

---

## تعديلات اختيارية على الـ Firmware

ليست مطلوبة إذا كان التطبيق الحالي يعمل. للتوحيد المستقبلي:

```cpp
// في sendData() بعد آخر حقل:
out.println(r, 2);  // يفضّل التأكد من \n أو \r\n
```

لزيادة عينات AI Mode (اختياري):

```cpp
#define SAMPLE_RATE_MS 33  // ~30 Hz بدل 20 Hz
```

---

## Binary vs AI — ما الذي يُرسل؟

نفس تيار البيانات لكلا الوضعين. الفرق في **التطبيق** فقط:

- **Binary** — يستخدم قيم flex فقط (threshold 2000)
- **AI** — يستخدم flex + IMU + pitch/roll لمدة التسجيل

---

## الخطوة التالية

- [Binary Mode](./04-binary-mode.md)
- [AI Mode](./05-ai-mode.md)
- [استكشاف الأخطاء](./08-troubleshooting.md)
