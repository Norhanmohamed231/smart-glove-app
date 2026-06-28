import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { ThemeColors } from '../theme/theme';

interface ScreenHeaderProps {
  title: string;
  rightAction?: React.ReactNode;
}

export function ScreenHeader({ title, rightAction }: ScreenHeaderProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.headerNav}>
      <TouchableOpacity onPress={() => router.back()} style={styles.sideButton} activeOpacity={0.7}>
        <ChevronLeft size={26} color={colors.textMain} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.sideButton}>{rightAction}</View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    headerNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 52,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder,
      backgroundColor: colors.backgroundStart,
    },
    sideButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      color: colors.textMain,
      fontSize: 18,
      fontWeight: '700',
    },
  });
