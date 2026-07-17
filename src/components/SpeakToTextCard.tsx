import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Mic } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { ThemeColors } from '../theme/theme';

interface SpeakToTextCardProps {
  phrase: string;
  accuracy: number;
  isListening: boolean;
  onMicPress: () => void;
  error?: string | null;
  disabled?: boolean;
  placeholder?: string;
}

export function SpeakToTextCard({
  phrase,
  accuracy,
  isListening,
  onMicPress,
  error,
  disabled = false,
  placeholder = 'اضغط المايك واتكلم بالعربي',
}: SpeakToTextCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Speak to Text</Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onMicPress}
        disabled={disabled && !isListening}
        style={[
          styles.micButton,
          isListening && styles.micButtonActive,
          disabled && !isListening && styles.micButtonDisabled,
        ]}
      >
        <Mic size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <Text style={styles.statusText}>
        {isListening ? 'جاري الاستماع... اضغط مرة أخرى للإيقاف' : 'اضغط للبدء'}
      </Text>

      <Text style={styles.phrase} numberOfLines={3}>
        {phrase || placeholder}
      </Text>
      <Text style={styles.accuracy}>Accuracy: {Math.round(accuracy)}%</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      padding: 22,
      alignItems: 'center',
    },
    title: { color: colors.textDescription, fontSize: 14, fontWeight: '600', marginBottom: 16 },
    micButton: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    micButtonActive: { backgroundColor: '#E53935' },
    micButtonDisabled: { opacity: 0.45 },
    statusText: {
      color: colors.textMuted,
      fontSize: 13,
      marginBottom: 8,
      textAlign: 'center',
    },
    phrase: { color: colors.textMain, fontSize: 16, fontWeight: '500', textAlign: 'center' },
    accuracy: { color: colors.textMuted, fontSize: 13, marginTop: 8 },
    error: {
      color: '#E53935',
      fontSize: 13,
      marginTop: 12,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
