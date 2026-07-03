# signTalker

Mobile companion app for the **SignGlove** assistive glove: receives sensor data over **Bluetooth Classic**, maps gestures to Arabic phrases, runs on-device LSTM inference, and speaks results on the device.

| | |
|---|---|
| **Stack** | Expo SDK 54 · React Native 0.81 · TypeScript · Zustand |
| **Platform** | **Android** (full glove support) · iOS/Web (UI only, no Classic BT) |
| **Package** | `com.signtalker.app` |

---

## Current status (July 2026)

| Area | Status | Notes |
|------|--------|--------|
| Home & navigation | Done | Expo Router: splash → home → choose mode → AI / Binary / History |
| Bluetooth Classic | Done | Scan, pair, connect (`react-native-bluetooth-classic`) |
| Runtime permissions | Done | Android 12+ `BLUETOOTH_CONNECT` / `BLUETOOTH_SCAN` + `RECORD_AUDIO` |
| Live data parser | Done | 14-field CSV lines from ESP32 |
| **Binary mode** | Done | 5-bit flex → dictionary → `expo-speech` TTS |
| Manual binary input | Done | Toggle bits without hardware |
| **AI mode** | Done | ONNX LSTM (20 classes) · manual Start/Stop recording |
| **Speak to Text** | Done | On-device Arabic STT (`expo-speech-recognition`) |
| History | Done | AI / Binary / Speech entries persisted in AsyncStorage |
| Battery indicator | Partial | Placeholder value in UI until firmware wiring |
| BLE firmware path | Planned | Phase 3 — Classic SPP today |

**Typical workflow:** pair the glove in Android Bluetooth settings → open signTalker → **Scan & Connect** → use **Binary Mode** or **AI Mode** (Start/Stop recording). Use **Speak to Text** for voice input in Arabic (requires Google Arabic offline speech pack).

---

## Features

- **Binary mode** — Real-time binarization (`flex ≥ 2000` → bent), debounced dictionary lookup, Arabic phrase output, TTS with cooldown.
- **AI mode** — Gesture recording via Start/Stop → ONNX LSTM inference → Arabic word + confidence → TTS + History.
- **Speak to Text** — On-device Arabic speech recognition (ar-EG / ar-SA); tap mic to start/stop.
- **Device scan modal** — Filters bonded/discovered devices (`SignGlove`, `sign`, `esp32` name hints).
- **Architecture** — Bluetooth → parser → pipeline router → Zustand store → screens ([details](docs/ARCHITECTURE_REFERENCE.md)).

---

## Requirements

- **Node.js** 18+ and npm
- **Android device** for glove + STT testing (emulator limited for Bluetooth)
- **Expo development build** — Bluetooth Classic, ONNX, and STT do **not** work in Expo Go; use `expo run:android` or an EAS build
- **ESP32 firmware** streaming CSV over Bluetooth Classic SPP (device name e.g. `SignGlove`)
- **STT:** Google Arabic offline speech recognition pack installed on the device

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Run on Android (development build)

```bash
npm run android
```

This runs `expo run:android`, uses the native `android/` project, and installs a debug build. After changing `app.json` native settings (package name, plugins), run:

```bash
npm run prebuild:android
npm run android
```

### 3. Release APK (local)

```bash
npm run android:apk
```

### 4. Other scripts

| Script | Description |
|--------|-------------|
| `npm start` | Metro / Expo dev server |
| `npm run prebuild:android` | Regenerate native Android project (`expo prebuild --clean`) |
| `npm run ios` | iOS native run (no Classic BT glove support) |
| `npm run web` | Static web export |
| `npm run lint` | ESLint |

---

## Using the glove (Android)

1. Power on the ESP32 glove and pair it in **Settings → Bluetooth** (look for `SignGlove` or similar).
2. Open signTalker → **Scan for Devices** → allow **Nearby devices / Bluetooth** when prompted.
3. Connect from the device list.
4. **Binary Mode** → select **Glove** (not Manual) for live bits from flex sensors.
5. **AI Mode** → press **Start Recording**, perform the gesture, then **Stop** → view detected word and confidence.

If Bluetooth is on but the app asks to enable it, check app permissions in system settings and reinstall after granting access.

---

## AI model assets

Bundled under `assets/models/`:

| File | Purpose |
|------|---------|
| `sign_lstm.onnx` | On-device LSTM inference |
| `preprocessors.json` | Scaler, classes, thresholds |
| `word_signatures.json` | Hybrid finger-pattern filter |

---

## Firmware data format

One line per frame (newline-delimited), **14 comma-separated numbers**:

```text
<timestamp>,flex_thumb,flex_index,flex_middle,flex_ring,flex_pinky,ax,ay,az,gx,gy,gz,pitch,roll
```

Legacy prefix also supported:

```text
DATA,<timestamp_ms>,<f1>..<f5>,<ax>..<roll>
```

- Sample rate: **20 Hz** (50 ms) recommended
- Flex ADC range used in UI: **0–4095**
- Binary threshold: **2000**

Full system design: [`docs/ARCHITECTURE_REFERENCE.md`](docs/ARCHITECTURE_REFERENCE.md).

---

## Project structure

```text
signtalker/
├── app/                      # Expo Router routes
│   ├── index.tsx             # Splash
│   ├── home.tsx
│   ├── choose-mode.tsx
│   ├── ai-mode.tsx
│   ├── binary-mode.tsx
│   └── history.tsx
├── src/
│   ├── components/
│   ├── features/
│   │   ├── bluetooth/
│   │   ├── parser/
│   │   ├── binary/
│   │   ├── ml/               # ONNX LSTM pipeline
│   │   ├── stt/              # On-device speech-to-text
│   │   ├── pipeline/
│   │   └── tts/
│   ├── screens/
│   ├── providers/
│   ├── store/
│   ├── hooks/
│   └── theme/
├── assets/models/
├── docs/
├── app.json
└── eas.json
```

Data flow:

```text
ESP32 (CSV) → BluetoothService → GloveDataParser → gloveFrameStream
  → GesturePipelineRouter (binary | sensor) → useAppStore → Screens + TTS
```

---

## Roadmap

| Phase | Scope |
|-------|--------|
| **1** | Binary mode, Classic BT, on-device TTS — **done** |
| **2** | AI mode with ONNX LSTM — **done** |
| **2.5** | On-device Arabic STT — **done** |
| **1.5** | Calibration UI, dictionary editor, real battery from glove |
| **3** | Optional BLE migration, expanded vocabulary |

---

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Connected but flex stays at 0 | Firmware not sending CSV, wrong format, or SPP not streaming |
| “Enable Bluetooth” while BT is on | Missing runtime permissions — allow in app settings |
| Binary mode doesn’t react | Source set to **Manual** instead of **Glove** |
| AI model failed to load | Rebuild native app after ONNX plugin changes (`prebuild:android`) |
| STT unavailable | Install Arabic offline speech pack in Google voice settings |
| Works on device, not in Expo Go | Expected — use a dev build (`npm run android`) |

---

## Related repositories

Firmware and ML training may live in separate repos (ESP32 firmware, Python LSTM training). This repo is the **React Native mobile app** only.

---

## License

See repository license file if present; otherwise contact the project maintainers.
