import React from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DictionaryEditModal } from '@/src/components/DictionaryEditModal';
import { DictionaryEntryRow } from '@/src/components/DictionaryEntryRow';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { BINARY_PATTERN_BITS } from '@/src/features/binary/gestureIllustrations';
import type { DictionaryEntry } from '@/src/features/binary/types';
import { useAppStore } from '@/src/store/useAppStore';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { ThemeColors } from '@/src/theme/theme';

export default function BinaryDictionaryScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const binaryDictionary = useAppStore((s) => s.binaryDictionary);
  const saveDictionaryEntry = useAppStore((s) => s.saveDictionaryEntry);
  const resetDictionaryEntry = useAppStore((s) => s.resetDictionaryEntry);
  const resetAllDictionary = useAppStore((s) => s.resetAllDictionary);

  const [query, setQuery] = React.useState('');
  const [selectedEntry, setSelectedEntry] = React.useState<DictionaryEntry | null>(null);

  const entries = React.useMemo(() => {
    const allEntries = BINARY_PATTERN_BITS.map((bits) => binaryDictionary[bits]).filter(Boolean);
    const trimmed = query.trim().toLowerCase();

    if (!trimmed) return allEntries;

    return allEntries.filter(
      (entry) =>
        entry.bits.includes(trimmed) ||
        entry.phrase.toLowerCase().includes(trimmed) ||
        entry.english.toLowerCase().includes(trimmed),
    );
  }, [binaryDictionary, query]);

  const handleResetAll = () => {
    Alert.alert('Reset all gestures', 'Restore all 32 gestures to their default phrases?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset All',
        style: 'destructive',
        onPress: () => {
          void resetAllDictionary();
        },
      },
    ]);
  };

  return (
    <LinearGradient
      colors={[colors.backgroundStart, colors.backgroundMid, colors.backgroundEnd]}
      style={styles.container}
    >
      <ScreenHeader title="Customize Dictionary" />

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Edit any of the 32 hand patterns. Arabic is spoken by TTS; English stays available for
          display and copy.
        </Text>

        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search by pattern, Arabic, or English..."
          placeholderTextColor={colors.textMuted}
        />

        <FlatList
          data={entries}
          keyExtractor={(item) => item.bits}
          renderItem={({ item }) => (
            <DictionaryEntryRow entry={item} onPress={() => setSelectedEntry(item)} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        />
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.resetAllButton} onPress={handleResetAll}>
          <Text style={styles.resetAllText}>Reset All to Defaults</Text>
        </TouchableOpacity>
      </View>

      <DictionaryEditModal
        visible={selectedEntry != null}
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onSave={async (phrase, english) => {
          if (!selectedEntry) return false;
          return saveDictionaryEntry(selectedEntry.bits, phrase, english);
        }}
        onReset={async () => {
          if (!selectedEntry) return;
          await resetDictionaryEntry(selectedEntry.bits);
        }}
      />
    </LinearGradient>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 16,
    },
    subtitle: {
      color: colors.textDescription,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 14,
    },
    searchInput: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      borderRadius: 14,
      color: colors.textMain,
      fontSize: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 16,
    },
    footer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 20,
      paddingTop: 12,
      backgroundColor: colors.backgroundStart,
      borderTopWidth: 1,
      borderTopColor: colors.cardBorder,
    },
    resetAllButton: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#EF4444',
      backgroundColor: 'rgba(239, 68, 68, 0.08)',
      paddingVertical: 14,
      alignItems: 'center',
    },
    resetAllText: {
      color: '#EF4444',
      fontSize: 15,
      fontWeight: '800',
    },
  });
