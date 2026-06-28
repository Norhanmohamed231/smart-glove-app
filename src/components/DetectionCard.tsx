import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Copy, Volume2 } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { ThemeColors } from '../theme/theme';

interface DetectionCardProps {
  listeningLabel?: string;
  arabicWord: string;
  english: string;
  confidence: number;
  onCopy: () => void;
  onSpeak: () => void;
}

export function DetectionCard({
  listeningLabel = 'Listening to glove...',
  arabicWord,
  english,
  confidence,
  onCopy,
  onSpeak,
}: DetectionCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const pct = Math.max(0, Math.min(100, Math.round(confidence)));

  return (
    <View>
      <View style={styles.listeningRow}>
        <View style={styles.pulseDot} />
        <Text style={styles.listeningText}>{listeningLabel}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Detected Word (Arabic)</Text>
        <View style={styles.wordRow}>
          <Text style={styles.arabicWord}>{arabicWord}</Text>
          <TouchableOpacity style={styles.speakerButton} activeOpacity={0.7} onPress={onSpeak}>
            <Volume2 size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.confidenceHeader}>
          <Text style={styles.confidenceLabel}>Confidence</Text>
          <Text style={styles.confidenceValue}>{pct}%</Text>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${pct}%` }]} />
        </View>

        <View style={styles.divider} />

        <Text style={styles.cardLabel}>English Translation</Text>
        <View style={styles.wordRow}>
          <Text style={styles.englishWord}>{english}</Text>
          <TouchableOpacity style={styles.copyButton} activeOpacity={0.7} onPress={onCopy}>
            <Copy size={18} color={colors.textDescription} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    listeningRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    pulseDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.success },
    listeningText: { color: colors.textDescription, fontSize: 14, fontWeight: '500' },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      padding: 22,
    },
    cardLabel: { color: colors.textDescription, fontSize: 13, fontWeight: '500', marginBottom: 8 },
    wordRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    arabicWord: { color: colors.primary, fontSize: 40, fontWeight: '800' },
    speakerButton: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: colors.primarySoft,
      justifyContent: 'center',
      alignItems: 'center',
    },
    confidenceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 8,
    },
    confidenceLabel: { color: colors.textDescription, fontSize: 13, fontWeight: '500' },
    confidenceValue: { color: colors.primary, fontSize: 14, fontWeight: '700' },
    barTrack: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 4, backgroundColor: colors.primary },
    divider: { height: 1, backgroundColor: colors.cardBorder, marginVertical: 20 },
    englishWord: { color: colors.textMain, fontSize: 22, fontWeight: '700' },
    copyButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.surfaceAlt,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
