import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { ThemeColors } from '@/src/theme/theme';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { DetectionCard } from '@/src/components/DetectionCard';
import { SpeakToTextCard } from '@/src/components/SpeakToTextCard';
import { useActiveMode, useAiDisplay } from '@/src/hooks/useGlovePipeline';
import { ttsService } from '@/src/features/tts/TTSService';
import { useAppStore } from '@/src/store/useAppStore';
import { recognizeSpeechMock } from '@/src/features/stt/mockStt';
import { AI_UNKNOWN_AR } from '@/src/features/ml/aiLabelMap';

export default function AiModeScreen() {
  useActiveMode('sensor');
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const { arabic, english, confidence, listeningLabel, hasDetection } = useAiDisplay();
  const addHistory = useAppStore((s) => s.addHistory);
  const [speech, setSpeech] = useState({ phrase: '', accuracy: 0 });
  const [isListening, setIsListening] = useState(false);

  const handleCopy = async () => {
    if (english !== '—') await Clipboard.setStringAsync(english);
  };

  const handleSpeak = () => {
    if (arabic === '—' || arabic === AI_UNKNOWN_AR) return;
    ttsService.speak(arabic, true);
    addHistory({ arabic, english, source: 'AI' });
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
          listeningLabel={listeningLabel}
          arabicWord={arabic}
          english={english}
          confidence={hasDetection ? confidence : 0}
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
