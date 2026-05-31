import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Volume2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '@/src/theme/theme';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import {
  useActiveMode,
  useBinaryDisplay,
  useManualBinaryInput,
} from '@/src/hooks/useGlovePipeline';
import { useAppStore } from '@/src/store/useAppStore';
import { ttsService } from '@/src/features/tts/TTSService';

const { width: screenWidth } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const FINGER_LABELS = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'];

export default function BinaryModeScreen() {
  useActiveMode('binary');

  const insets = useSafeAreaInsets();
  const { liveBits, pattern, label, phrase } = useBinaryDisplay();
  const inputSource = useAppStore((s) => s.inputSource);
  const latestFrame = useAppStore((s) => s.latestFrame);
  const connectionState = useAppStore((s) => s.connectionState);
  const setInputSource = useAppStore((s) => s.setInputSource);
  const { toggleManualBit } = useManualBinaryInput();

  const mobileNodeWidth = (screenWidth - 40 - 32) / 5;
  const isConnected = connectionState === 'connected';

  return (
    <LinearGradient colors={[THEME.colors.backgroundStart, THEME.colors.backgroundMid]} style={styles.container}>
      <ScreenHeader title="Binary Matrix" />
      <ScrollView
        contentContainerStyle={[
          styles.innerContainer,
          !isWeb && { paddingBottom: insets.bottom + 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.liveStatus}>
          {isConnected ? '● Connected · LIVE' : '○ Disconnected'}
          {' · '}
          {inputSource === 'glove' ? 'Glove' : 'Manual'}
        </Text>

        <Text style={styles.sectionLabel}>BIT MATRIX CONTROLLER</Text>

        <View style={styles.bitContainer}>
          {liveBits.map((bit, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.bitNode,
                { width: isWeb ? (screenWidth - 48 - 32) / 5 : mobileNodeWidth },
                bit === 1 ? styles.bitNodeOn : styles.bitNodeOff,
              ]}
              onPress={() => {
                if (inputSource === 'manual' || !isConnected) {
                  toggleManualBit(index);
                }
              }}
              activeOpacity={inputSource === 'manual' || !isConnected ? 0.7 : 1}
            >
              <Text style={styles.bitIndex}>
                {FINGER_LABELS[index][0]}
                {index + 1}
              </Text>
              <Text
                style={[
                  styles.bitValue,
                  { color: bit === 1 ? THEME.colors.greenNeon : THEME.colors.textMuted },
                ]}
              >
                {bit}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sourceRow}>
          <TouchableOpacity
            style={[styles.sourceChip, inputSource === 'glove' && styles.sourceChipActive]}
            onPress={() => isConnected && setInputSource('glove')}
            disabled={!isConnected}
          >
            <Text style={styles.sourceText}>Glove</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sourceChip, inputSource === 'manual' && styles.sourceChipActive]}
            onPress={() => setInputSource('manual')}
          >
            <Text style={styles.sourceText}>Manual</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.predictionBox}>
          <LinearGradient colors={['#251A3E', '#161026']} style={StyleSheet.absoluteFillObject} />
          <Text style={[styles.predictionLabel, { color: THEME.colors.purpleNeon }]}>
            CURRENT SIGN MAPPING
          </Text>
          <Text style={[styles.predictionOutput, { color: '#E0AAFF' }]}>{label}</Text>
          <Text style={styles.patternText}>{pattern}</Text>
        </View>

        <View style={styles.speechCard}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.speechLabel, { color: THEME.colors.purpleNeon }]}>SAVED PHRASE</Text>
            <Text style={styles.speechStream} numberOfLines={3}>
              {phrase}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.ttsButton}
            activeOpacity={0.6}
            onPress={() => phrase && ttsService.speak(phrase, true)}
          >
            <Volume2 color={THEME.colors.purpleNeon} size={isWeb ? 24 : 22} />
          </TouchableOpacity>
        </View>

        {latestFrame && inputSource === 'glove' && (
          <Text style={styles.rawDebug}>
            Raw: {latestFrame.flex.thumb} {latestFrame.flex.index} {latestFrame.flex.middle}{' '}
            {latestFrame.flex.ring} {latestFrame.flex.pinky}
          </Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { paddingHorizontal: isWeb ? 24 : 20, paddingTop: 12 },
  liveStatus: { color: THEME.colors.textDescription, fontSize: 12, marginBottom: 16, fontWeight: '600' },
  sectionLabel: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 16,
  },
  bitContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  bitNode: {
    height: isWeb ? 80 : 72,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bitNodeOn: { backgroundColor: 'rgba(57, 255, 20, 0.08)', borderColor: 'rgba(57, 255, 20, 0.3)' },
  bitNodeOff: { backgroundColor: '#16172B', borderColor: THEME.colors.cardBorder },
  bitIndex: { color: THEME.colors.textMuted, fontSize: isWeb ? 11 : 10, fontWeight: '600', marginBottom: 2 },
  bitValue: { fontSize: isWeb ? 24 : 20, fontWeight: '800' },
  sourceRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  sourceChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  sourceChipActive: { borderColor: THEME.colors.purpleNeon, backgroundColor: 'rgba(155, 81, 224, 0.12)' },
  sourceText: { color: THEME.colors.textMain, fontSize: 13, fontWeight: '600' },
  predictionBox: {
    height: isWeb ? 180 : 150,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isWeb ? 24 : 20,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  predictionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: isWeb ? 3 : 2, marginBottom: 6 },
  predictionOutput: { fontSize: isWeb ? 36 : 28, fontWeight: '900' },
  patternText: { color: THEME.colors.textMuted, marginTop: 6, fontSize: 14, letterSpacing: 2 },
  speechCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    padding: isWeb ? 20 : 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  speechLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
  speechStream: { color: THEME.colors.textMain, fontSize: isWeb ? 16 : 14, fontWeight: '500' },
  ttsButton: {
    width: isWeb ? 48 : 42,
    height: isWeb ? 48 : 42,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(155, 81, 224, 0.2)',
    backgroundColor: 'rgba(155, 81, 224, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: isWeb ? 16 : 10,
  },
  rawDebug: { color: THEME.colors.textMuted, fontSize: 11, marginTop: 16, textAlign: 'center' },
});
