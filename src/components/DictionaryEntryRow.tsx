import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureIllustration } from '@/src/components/GestureIllustration';
import { formatFingerBits } from '@/src/features/binary/gestureIllustrations';
import type { DictionaryEntry } from '@/src/features/binary/types';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { ThemeColors } from '@/src/theme/theme';

interface DictionaryEntryRowProps {
  entry: DictionaryEntry;
  onPress: () => void;
}

export function DictionaryEntryRow({ entry, onPress }: DictionaryEntryRowProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.85} onPress={onPress}>
      <GestureIllustration bits={entry.bits} size={68} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.pattern}>{entry.bits}</Text>
          {entry.isCustomized ? (
            <View style={styles.customBadge}>
              <Text style={styles.customBadgeText}>Custom</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.phrase} numberOfLines={2}>
          {entry.phrase}
        </Text>
        <Text style={styles.fingers}>{formatFingerBits(entry.bits)}</Text>
        <Text style={styles.english} numberOfLines={1}>
          {entry.english}
        </Text>
      </View>

      <Text style={styles.editLabel}>Edit</Text>
    </TouchableOpacity>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      padding: 14,
      marginBottom: 12,
    },
    content: {
      flex: 1,
      minWidth: 0,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    pattern: {
      color: colors.tagBinary,
      fontFamily: 'monospace',
      fontSize: 13,
      fontWeight: '700',
    },
    customBadge: {
      backgroundColor: 'rgba(168, 85, 247, 0.16)',
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    customBadgeText: {
      color: colors.tagBinary,
      fontSize: 10,
      fontWeight: '700',
    },
    phrase: {
      color: colors.textMain,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 4,
    },
    fingers: {
      color: colors.textMuted,
      fontSize: 11,
      marginBottom: 2,
    },
    english: {
      color: colors.textDescription,
      fontSize: 12,
      fontWeight: '500',
    },
    editLabel: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '700',
    },
  });
