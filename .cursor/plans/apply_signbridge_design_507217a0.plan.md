---
name: Apply SignBridge Design
overview: تطبيق تصميم SignBridge الجديد (ستايل فاتح/أزرق + وضع ليلي قابل للتبديل) عبر بناء نظام ثيم جديد، وإضافة شاشات Choose Mode و History و AI Mode، وإعادة تصميم Splash/Home/Binary، مع بيانات وهمية للبطارية والذكاء الاصطناعي وتحويل الكلام لنص ليتم ربطها لاحقاً.
todos:
  - id: theme-system
    content: "بناء نظام الثيم: لوحتا light/dark في src/theme/theme.ts + ThemeProvider مع useTheme() وحفظ الوضع في AsyncStorage، وتغليف app/_layout.tsx"
    status: completed
  - id: history-store
    content: إضافة شريحة History (addHistory/clearHistory) + battery + confidence إلى useAppStore مع الحفظ في AsyncStorage، وإضافة EN_DICTIONARY للترجمة الإنجليزية
    status: completed
  - id: splash-home
    content: "إعادة تصميم Splash و Home بالستايل الفاتح: حالة القفاز + البطارية + Start Translation + View History + زر الوضع الليلي + فتح مودال الاتصال"
    status: completed
  - id: choose-mode
    content: إنشاء شاشة Choose Mode (ChooseModeScreen + app/choose-mode.tsx) ببطاقتي AI/Binary وزر Dark Mode
    status: completed
  - id: ai-mode
    content: "إنشاء شاشة AI Mode (AiModeScreen + app/ai-mode.tsx) ببيانات وهمية: كلمة عربية + Confidence + ترجمة + نسخ + سماعة + مايك + Accuracy"
    status: completed
  - id: binary-redesign
    content: إعادة تصميم Binary Mode لتطابق التصميم مع الإبقاء على منطق الـ5-bit والقاموس وإضافة Confidence والترجمة الإنجليزية
    status: completed
  - id: history-screen
    content: إنشاء شاشة History (HistoryScreen + app/history.tsx) بقائمة العناصر (عربي/إنجليزي/وسم/وقت) وزر حذف الكل
    status: completed
  - id: placeholders-nav
    content: ربط placeholders (مايك Speech-to-Text وهمي، البطارية)، تحديث ScreenHeader للثيم، وإضافة expo-clipboard لزر النسخ
    status: completed
isProject: false
---

## نظرة عامة

التصميم قابل للتطبيق بالكامل على نفس الـ stack الحالي (Expo Router + React Native + zustand + lucide). الخطة تبني ستايل فاتح/أزرق كأساس مع زر تبديل للوضع الليلي، وتضيف الشاشات الناقصة، مع placeholders للميزات التي تحتاج عتاد/ذكاء اصطناعي لاحقاً.

الاختيارات المعتمدة: ستايل فاتح/أزرق + Dark toggle، وبناء الواجهات كاملة الآن ببيانات وهمية للبطارية وتحويل الكلام لنص ومحرك الذكاء الاصطناعي.

## 1. نظام الثيم (التغيير الأساسي الشامل)

- تحويل [src/theme/theme.ts](src/theme/theme.ts) من ثابت واحد مظلم إلى لوحتين: `lightColors` (خلفية بيضاء/رمادي فاتح، أزرق `#2563EB`، أخضر اتصال `#22C55E`، نص داكن) و`darkColors` (مطابقة لأعمدة التصميم الداكنة).
- إنشاء `src/theme/ThemeProvider.tsx` فيه `ThemeContext` + `useTheme()` يرجّع `{ colors, mode, toggleTheme }`، مع حفظ الاختيار في `AsyncStorage` (المكتبة مثبتة مسبقاً).
- تغليف التطبيق في [app/\_layout.tsx](app/_layout.tsx) بـ `ThemeProvider`.
- نمط الستايل: كل شاشة تستخدم `const { colors } = useTheme()` مع دالة `createStyles(colors)` بدل `StyleSheet.create` الثابت، لأن الألوان أصبحت ديناميكية.

## 2. الشاشات (إعادة تصميم + جديدة)

- Splash: إعادة تصميم [src/screens/SplashScreen.tsx](src/screens/SplashScreen.tsx) بستايل فاتح + شعار "SignBridge" وأيقونة يد ونص "Smart Glove Translation".
- Home: إعادة تصميم [src/screens/HomeScreen.tsx](src/screens/HomeScreen.tsx): بطاقة حالة القفاز (Connected + نسبة البطارية)، زر "Start Translation" ينقل إلى Choose Mode، زر "View History"، أيقونة قائمة، وزر القمر لتبديل الوضع الليلي. الضغط على بطاقة الحالة يفتح `DeviceScanModal` الحالي للاتصال.
- Choose Mode (جديدة): `src/screens/ChooseModeScreen.tsx` + route `app/choose-mode.tsx`، فيها بطاقتا AI Mode و Binary Mode + Dark Mode toggle.
- AI Mode (جديدة): `src/screens/AiModeScreen.tsx` + route `app/ai-mode.tsx` (تحل محل دور sensor-mode): شريط "Listening...", الكلمة العربية المكتشفة، شريط Confidence، الترجمة الإنجليزية، زر نسخ + زر سماعة (TTS الموجود)، زر "Speak to Text" (مايك)، ونسبة Accuracy. تعمل ببيانات وهمية حالياً.
- Binary Mode: إعادة تصميم [src/screens/BinaryModeScreen.tsx](src/screens/BinaryModeScreen.tsx) لتطابق التصميم (كلمة عربية + Confidence + ترجمة إنجليزية + نسخ + سماعة + مايك) مع الإبقاء على مصفوفة الـ5-bit والمنطق الحالي عبر `useBinaryDisplay`.
- History (جديدة): `src/screens/HistoryScreen.tsx` + route `app/history.tsx`: قائمة عناصر (عربي + إنجليزي + وسم AI/Binary/Speech + وقت) مع زر حذف الكل.

## 3. الحالة والبيانات

- إضافة شريحة History إلى [src/store/useAppStore.ts](src/store/useAppStore.ts): `history: HistoryEntry[]`، `addHistory()`، `clearHistory()`، محفوظة في `AsyncStorage`. النوع: `{ id, arabic, english, source: 'AI'|'Binary'|'Speech', timestamp }`.
- إضافة قاموس إنجليزي مقابل العربي في `src/features/binary/defaultDictionary.ts` (مثل `EN_DICTIONARY` بنفس مفاتيح الـbits) لعرض الترجمة الإنجليزية تحت العربية.
- إضافة `battery: number` (قيمة وهمية مثل 78) و`confidence` للـ store مع تعليق أنها تُربط بالعتاد/الموديل لاحقاً.
- ربط الإضافة للـHistory: عند ثبات كلمة في Binary (source `Binary`)، ومن AI Mode (source `AI`) ومن المايك (source `Speech`).

## 4. الميزات ذات الـ Placeholder

- Speak to Text (مايك): زر بالواجهة يعرض عبارة وهمية مكتشفة ويضيفها للـHistory كـ`Speech`، مع TODO لإضافة مكتبة STT وأذونات المايك لاحقاً.
- البطارية: عرض القيمة الوهمية من الـstore (تحتاج دعم firmware لاحقاً).
- AI Mode: كلمة/Confidence/ترجمة وهمية ثابتة (محرك LSTM لاحقاً).
- زر النسخ: يحتاج `expo-clipboard` (غير مثبتة) — تُضاف كخطوة install؛ أو زر بلا وظيفة مؤقتاً إن لم ترغب بإضافة تبعية.

## 5. تحديثات التنقّل

- تحديث `ScreenHeader` ليستخدم الثيم وألوان فاتحة، ودعم زر حذف اختياري (لشاشة History).
- مسارات جديدة: `app/choose-mode.tsx`, `app/ai-mode.tsx`, `app/history.tsx`. الإبقاء على `app/sensor-mode.tsx` أو تحويله لـ AI Mode.

## ملاحظات

- أكبر مجهود هو إعادة الستايل الشاملة بسبب الانتقال من ثيم ثابت إلى ثيم ديناميكي (فاتح/ليلي) عبر كل الشاشات.
- منطق الـBluetooth والـBinary وTTS الحالي يبقى كما هو ويُعاد استخدامه.
