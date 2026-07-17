import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { Mic, Square } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { ThemeColors } from '@/src/theme/theme';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { DetectionCard } from '@/src/components/DetectionCard';
import { SpeakToTextCard } from '@/src/components/SpeakToTextCard';
import { useActiveMode, useAiDisplay, useAiRecording } from '@/src/hooks/useGlovePipeline';
import { useStt } from '@/src/hooks/useStt';
import { ttsService } from '@/src/features/tts/TTSService';
import { useAppStore } from '@/src/store/useAppStore';
import { AI_UNKNOWN_AR } from '@/src/features/ml/aiLabelMap';

export default function AiModeScreen() {
  useActiveMode('sensor');
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const { arabic, english, confidence, listeningLabel, hasDetection } = useAiDisplay();
  const { isRecording, isPredicting, canRecord, collectedCount, toggleRecording } = useAiRecording();
  const {
    phrase,
    accuracy,
    isListening,
    isChecking,
    error,
    toggleListening,
  } = useStt();
  const addHistory = useAppStore((s) => s.addHistory);

  const handleCopy = async () => {
    if (english !== '—') await Clipboard.setStringAsync(english);
  };

  const handleSpeak = () => {
    if (arabic === '—' || arabic === AI_UNKNOWN_AR) return;
    ttsService.speak(arabic, true);
    addHistory({ arabic, english, source: 'AI' });
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

        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording ? styles.recordButtonStop : styles.recordButtonStart,
            !canRecord && !isRecording && styles.recordButtonDisabled,
          ]}
          activeOpacity={0.85}
          onPress={toggleRecording}
          disabled={!canRecord}
        >
          {isRecording ? (
            <Square size={22} color="#fff" fill="#fff" />
          ) : (
            <Mic size={22} color="#fff" />
          )}
          <Text style={styles.recordButtonText}>
            {isPredicting
              ? 'Recognizing sign...'
              : isRecording
                ? `Recording... (${collectedCount} frames)`
                : 'Start Recording'}
          </Text>
        </TouchableOpacity>

        <View style={styles.spacer} />

        <SpeakToTextCard
          phrase={phrase}
          accuracy={accuracy}
          isListening={isListening}
          onMicPress={toggleListening}
          error={error}
          disabled={isChecking}
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
    recordButton: {
      marginTop: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: 16,
      borderRadius: 18,
    },
    recordButtonStart: {
      backgroundColor: colors.primary,
    },
    recordButtonStop: {
      backgroundColor: '#E53935',
    },
    recordButtonDisabled: {
      opacity: 0.45,
    },
    recordButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },
  });
