import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trash2, Clock } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { ThemeColors } from '@/src/theme/theme';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { useAppStore, type HistoryEntry, type HistorySource } from '@/src/store/useAppStore';

function formatTime(ts: number): string {
  const d = new Date(ts);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export default function HistoryScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const history = useAppStore((s) => s.history);
  const clearHistory = useAppStore((s) => s.clearHistory);

  const tagColor = (source: HistorySource) =>
    source === 'AI' ? colors.tagAi : source === 'Binary' ? colors.tagBinary : colors.tagSpeech;

  const confirmClear = () => {
    if (history.length === 0) return;
    Alert.alert('Clear History', 'Delete all saved translations?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete All', style: 'destructive', onPress: clearHistory },
    ]);
  };

  const renderItem = ({ item }: { item: HistoryEntry }) => (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.arabic}>{item.arabic}</Text>
        <Text style={styles.english}>{item.english}</Text>
      </View>
      <View style={styles.rowMeta}>
        <View style={[styles.tag, { backgroundColor: tagColor(item.source) }]}>
          <Text style={styles.tagText}>{item.source}</Text>
        </View>
        <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={[colors.backgroundStart, colors.backgroundMid, colors.backgroundEnd]}
      style={styles.container}
    >
      <ScreenHeader
        title="History"
        rightAction={
          <TouchableOpacity onPress={confirmClear} activeOpacity={0.7}>
            <Trash2 size={22} color={history.length ? colors.error : colors.textMuted} />
          </TouchableOpacity>
        }
      />

      {history.length === 0 ? (
        <View style={styles.empty}>
          <Clock size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>No translations yet</Text>
          <Text style={styles.emptySub}>Your translated words and phrases will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    list: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
    rowText: { flex: 1, gap: 4 },
    arabic: { color: colors.textMain, fontSize: 17, fontWeight: '700' },
    english: { color: colors.textDescription, fontSize: 14 },
    rowMeta: { alignItems: 'flex-end', gap: 6 },
    tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
    tagText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
    time: { color: colors.textMuted, fontSize: 12 },
    separator: { height: 1, backgroundColor: colors.cardBorder },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, gap: 12 },
    emptyText: { color: colors.textMain, fontSize: 18, fontWeight: '700' },
    emptySub: { color: colors.textDescription, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  });
