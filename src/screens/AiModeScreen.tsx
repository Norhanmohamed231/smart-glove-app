import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { ThemeColors } from '@/src/theme/theme';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { DetectionCard } from '@/src/components/DetectionCard';
import { SpeakToTextCard } from '@/src/components/SpeakToTextCard';
import { useActiveMode } from '@/src/hooks/useGlovePipeline';
import { ttsService } from '@/src/features/tts/TTSService';
import { useAppStore } from '@/src/store/useAppStore';
import { recognizeSpeechMock } from '@/src/features/stt/mockStt';

// Mock detection until the LSTM model is wired in (Phase 2).
const MOCK_DETECTION = { arabic: 'مرحبا', english: 'Hello', confidence: 96 };

export default function AiModeScreen() {
  useActiveMode('sensor');
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const addHistory = useAppStore((s) => s.addHistory);
  const [speech, setSpeech] = useState({ phrase: '', accuracy: 0 });
  const [isListening, setIsListening] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(MOCK_DETECTION.english);
  };

  const handleSpeak = () => {
    ttsService.speak(MOCK_DETECTION.arabic, true);
    addHistory({ arabic: MOCK_DETECTION.arabic, english: MOCK_DETECTION.english, source: 'AI' });
  };

  const handleMic = () => {
    setIsListening(true);
    setTimeout(() => {
      const result = recognizeSpeechMock();
      setSpeech({ phrase: result.arabic, accuracy: result.accuracy });
      addHistory({ arabic: result.arabic, english: result.english, source: 'Speech' });
      setIsListening(false);
    }, 1200);
  };

  return (
    <LinearGradient
      colors={[colors.backgroundStart, colors.backgroundMid, colors.backgroundEnd]}
      style={styles.container}
    >
      <ScreenHeader title="AI Mode" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <DetectionCard
          arabicWord={MOCK_DETECTION.arabic}
          english={MOCK_DETECTION.english}
          confidence={MOCK_DETECTION.confidence}
          onCopy={handleCopy}
          onSpeak={handleSpeak}
        />

        <View style={styles.spacer} />

        <SpeakToTextCard
          phrase={speech.phrase}
          accuracy={speech.accuracy || 95}
          isListening={isListening}
          onMicPress={handleMic}
        />
      </ScrollView>
    </LinearGradient>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
    spacer: { height: 18 },
  });
