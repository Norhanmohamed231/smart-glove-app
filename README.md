# SignBridge

Mobile companion app for the **SignGlove** assistive glove: receives sensor data over **Bluetooth Classic**, maps gestures to Arabic phrases, and speaks them on-device.

| | |
|---|---|
| **Stack** | Expo SDK 54 · React Native 0.81 · TypeScript · Zustand |
| **Platform** | **Android** (full glove support) · iOS/Web (UI only, no Classic BT) |
| **Package** | `com.signbridge.app` |

---

## Current status (May 2026)

| Area | Status | Notes |
|------|--------|--------|
| Home & navigation | Done | Expo Router: splash → home → modes |
| Bluetooth Classic | Done | Scan, pair, connect (`react-native-bluetooth-classic`) |
| Runtime permissions | Done | Android 12+ `BLUETOOTH_CONNECT` / `BLUETOOTH_SCAN` |
| Live data parser | Done | 14-field CSV lines from ESP32 |
| **Binary mode** | Done | 5-bit flex → dictionary → `expo-speech` TTS |
| Manual binary input | Done | Toggle bits without hardware |
| **Sensor mode UI** | Partial | Live flex bars + buffer preview |
| LSTM / AI translation | Planned | Phase 2 — placeholder UI only |
| BLE firmware path | Planned | Phase 3 — Classic SPP today |

**Typical workflow today:** pair the glove in Android Bluetooth settings → open SignBridge → **Scan & Connect** → use **Binary Mode** (Glove or Manual). Sensor mode shows live flex when the firmware stream matches the expected format (see [Firmware format](#firmware-data-format)).

---

## Features

- **Binary custom mode** — Real-time binarization (`flex ≥ 2000` → bent), debounced dictionary lookup, Arabic phrase output, TTS with cooldown.
- **Sensor mode (preview)** — Per-finger flex bars and frame buffer counter; LSTM engine not wired yet.
- **Device scan modal** — Filters bonded/discovered devices (`SignGlove`, `sign`, `esp32` name hints).
- **Architecture** — Bluetooth → parser → pipeline router → Zustand store → screens ([details](docs/ARCHITECTURE_REFERENCE.md)).

---

## Requirements

- **Node.js** 18+ and npm
- **Android device or emulator** for glove testing
- **Expo development build** — Bluetooth Classic does **not** work in Expo Go; use `expo run:android` or an EAS build
- **ESP32 firmware** streaming CSV over Bluetooth Classic SPP (device name e.g. `SignGlove`)

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

This runs `expo run:android`, generates the native `android/` project locally (gitignored), and installs a debug build.

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
2. Open SignBridge → **Scan for Devices** → allow **Nearby devices / Bluetooth** when prompted.
3. Connect from the device list.
4. **Binary Mode** → select **Glove** (not Manual) for live bits from flex sensors.
5. **Sensor Mode** → confirms connection; flex values update only when valid CSV frames arrive.

If Bluetooth is on but the app asks to enable it, check app permissions in system settings and reinstall after granting access.

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
signbridge-app/
├── app/                      # Expo Router routes (thin wrappers)
│   ├── index.tsx             # Splash
│   ├── home.tsx
│   ├── binary-mode.tsx
│   └── sensor-mode.tsx
├── src/
│   ├── components/           # UI (ConnectionPanel, DeviceScanModal, …)
│   ├── features/
│   │   ├── bluetooth/        # BluetoothService, permissions
│   │   ├── parser/           # GloveDataParser
│   │   ├── binary/           # Dictionary + binarization
│   │   ├── ml/               # LSTM placeholder (Phase 2)
│   │   ├── pipeline/         # Frame stream + mode router
│   │   └── tts/
│   ├── screens/              # Screen implementations
│   ├── providers/            # GlovePipelineProvider
│   ├── store/                # Zustand app state
│   ├── hooks/
│   └── theme/
├── assets/
├── docs/
├── app.json
└── eas.json
```

Data flow:

```text
ESP32 (CSV lines) → BluetoothService → GloveDataParser → gloveFrameStream
  → GesturePipelineRouter (binary | sensor) → useAppStore → Screens + TTSService
```

---

## Roadmap

| Phase | Scope |
|-------|--------|
| **1** (current) | Binary mode, Classic BT, on-device TTS, manual + glove input |
| **1.5** | Calibration UI, dictionary editor, richer charts |
| **2** | Retrain LSTM → TFLite → live Sensor mode inference |
| **3** | Optional BLE migration, expanded vocabulary |

---

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Connected but flex stays at 0 | Firmware not sending CSV, wrong format, or SPP not streaming |
| “Enable Bluetooth” while BT is on | Missing runtime permissions — allow in app settings |
| Binary mode doesn’t react | Source set to **Manual** instead of **Glove** |
| Works on device, not in Expo Go | Expected — use a dev build (`npm run android`) |

---

## Related repositories

Firmware and ML training may live in separate repos (ESP32 `test1.ino`, Python LSTM training). This repo is the **React Native mobile app** only.

---

## License

See repository license file if present; otherwise contact the project maintainers.
