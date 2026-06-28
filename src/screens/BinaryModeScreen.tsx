import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { ThemeColors } from '@/src/theme/theme';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { DetectionCard } from '@/src/components/DetectionCard';
import { SpeakToTextCard } from '@/src/components/SpeakToTextCard';
import {
  useActiveMode,
  useBinaryDisplay,
  useManualBinaryInput,
} from '@/src/hooks/useGlovePipeline';
import { useAppStore } from '@/src/store/useAppStore';
import { ttsService } from '@/src/features/tts/TTSService';
import { lookupEnglish } from '@/src/features/binary/defaultDictionary';
import { UNKNOWN_PATTERN } from '@/src/features/binary/defaultDictionary';
import { recognizeSpeechMock } from '@/src/features/stt/mockStt';

const { width: screenWidth } = Dimensions.get('window');
const FINGER_LABELS = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'];

export default function BinaryModeScreen() {
  useActiveMode('binary');

  const { colors } = useTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();

  const { liveBits, pattern, label } = useBinaryDisplay();
  const inputSource = useAppStore((s) => s.inputSource);
  const connectionState = useAppStore((s) => s.connectionState);
  const setInputSource = useAppStore((s) => s.setInputSource);
  const addHistory = useAppStore((s) => s.addHistory);
  const { toggleManualBit } = useManualBinaryInput();

  const [speech, setSpeech] = useState({ phrase: '', accuracy: 0 });
  const [isListening, setIsListening] = useState(false);

  const isConnected = connectionState === 'connected';
  const bitsKey = liveBits.join('');
  const english = lookupEnglish(bitsKey);
  const isKnown = label !== UNKNOWN_PATTERN;
  const confidence = isKnown ? 100 : 0;
  const nodeWidth = (screenWidth - 48 - 8 * 4) / 5;

  const handleCopy = async () => {
    if (isKnown) await Clipboard.setStringAsync(english);
  };

  const handleSpeak = () => {
    if (!isKnown) return;
    ttsService.speak(label, true);
    addHistory({ arabic: label, english, source: 'Binary' });
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
      <ScreenHeader title="Binary Mode" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <DetectionCard
          arabicWord={isKnown ? label : '—'}
          english={isKnown ? english : '—'}
          confidence={confidence}
          onCopy={handleCopy}
          onSpeak={handleSpeak}
        />

        <Text style={styles.sectionLabel}>BIT MATRIX CONTROLLER</Text>
        <View style={styles.bitRow}>
          {liveBits.map((bit, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.bitNode,
                { width: nodeWidth },
                bit === 1 ? styles.bitNodeOn : styles.bitNodeOff,
              ]}
              onPress={() => {
                if (inputSource === 'manual' || !isConnected) toggleManualBit(index);
              }}
              activeOpacity={inputSource === 'manual' || !isConnected ? 0.7 : 1}
            >
              <Text style={styles.bitIndex}>
                {FINGER_LABELS[index][0]}
                {index + 1}
              </Text>
              <Text style={[styles.bitValue, { color: bit === 1 ? colors.success : colors.textMuted }]}>
                {bit}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.patternText}>Pattern: {pattern}</Text>

        <View style={styles.sourceRow}>
          <TouchableOpacity
            style={[styles.sourceChip, inputSource === 'glove' && styles.sourceChipActive]}
            onPress={() => isConnected && setInputSource('glove')}
            disabled={!isConnected}
          >
            <Text style={[styles.sourceText, inputSource === 'glove' && styles.sourceTextActive]}>Glove</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sourceChip, inputSource === 'manual' && styles.sourceChipActive]}
            onPress={() => setInputSource('manual')}
          >
            <Text style={[styles.sourceText, inputSource === 'manual' && styles.sourceTextActive]}>Manual</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} />

        <SpeakToTextCard
          phrase={speech.phrase}
          accuracy={speech.accuracy || 96}
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
    scroll: { paddingHorizontal: 24, paddingTop: 20 },
    sectionLabel: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      marginTop: 24,
      marginBottom: 14,
    },
    bitRow: { flexDirection: 'row', justifyContent: 'space-between' },
    bitNode: {
      height: 72,
      borderRadius: 14,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    bitNodeOn: { backgroundColor: 'rgba(34, 197, 94, 0.12)', borderColor: colors.success },
    bitNodeOff: { backgroundColor: colors.surfaceAlt, borderColor: colors.cardBorder },
    bitIndex: { color: colors.textMuted, fontSize: 10, fontWeight: '600', marginBottom: 2 },
    bitValue: { fontSize: 22, fontWeight: '800' },
    patternText: { color: colors.textDescription, fontSize: 13, marginTop: 12, letterSpacing: 1 },
    sourceRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
    sourceChip: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      backgroundColor: colors.surface,
    },
    sourceChipActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
    sourceText: { color: colors.textDescription, fontSize: 13, fontWeight: '600' },
    sourceTextActive: { color: colors.primary },
    spacer: { height: 22 },
  });
