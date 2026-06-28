import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Brain, Grid3x3, ChevronRight, Moon } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { ThemeColors } from '@/src/theme/theme';
import { ScreenHeader } from '@/src/components/ScreenHeader';

export default function ChooseModeScreen() {
  const { colors, mode, toggleTheme } = useTheme();
  const styles = createStyles(colors);

  return (
    <LinearGradient
      colors={[colors.backgroundStart, colors.backgroundMid, colors.backgroundEnd]}
      style={styles.container}
    >
      <ScreenHeader title="Choose Mode" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Choose Mode</Text>
        <Text style={styles.subheading}>Select the translation mode</Text>

        <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/ai-mode')}>
          <View style={styles.modeCard}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
              <Brain size={26} color={colors.primary} />
            </View>
            <View style={styles.modeTextWrap}>
              <Text style={styles.modeTitle}>AI Mode</Text>
              <Text style={styles.modeDesc}>Uses AI model to recognize gestures</Text>
            </View>
            <ChevronRight size={22} color={colors.textMuted} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/binary-mode')}>
          <View style={styles.modeCard}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
              <Grid3x3 size={26} color={colors.primary} />
            </View>
            <View style={styles.modeTextWrap}>
              <Text style={styles.modeTitle}>Binary Mode</Text>
              <Text style={styles.modeDesc}>Uses binary signals for gesture recognition</Text>
            </View>
            <ChevronRight size={22} color={colors.textMuted} />
          </View>
        </TouchableOpacity>

        <View style={styles.darkRow}>
          <View style={styles.darkLabelWrap}>
            <Moon size={20} color={colors.textDescription} />
            <Text style={styles.darkLabel}>Dark Mode</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={toggleTheme}
            style={[styles.switchTrack, mode === 'dark' && styles.switchTrackOn]}
          >
            <View style={[styles.switchThumb, mode === 'dark' && styles.switchThumbOn]} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
    heading: { color: colors.textMain, fontSize: 26, fontWeight: '800', marginBottom: 6 },
    subheading: { color: colors.textDescription, fontSize: 15, marginBottom: 28 },
    modeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      padding: 18,
      marginBottom: 16,
    },
    iconWrap: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    modeTextWrap: { flex: 1, gap: 4 },
    modeTitle: { color: colors.textMain, fontSize: 18, fontWeight: '700' },
    modeDesc: { color: colors.textDescription, fontSize: 13, lineHeight: 18 },
    darkRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      paddingHorizontal: 4,
    },
    darkLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    darkLabel: { color: colors.textMain, fontSize: 15, fontWeight: '600' },
    switchTrack: {
      width: 52,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.cardBorder,
      padding: 3,
      justifyContent: 'center',
    },
    switchTrackOn: { backgroundColor: colors.primary },
    switchThumb: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#FFFFFF',
    },
    switchThumbOn: { alignSelf: 'flex-end' },
  });
