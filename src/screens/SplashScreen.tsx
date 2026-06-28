import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Hand } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { ThemeColors } from '@/src/theme/theme';

export default function SplashScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const [done, setDone] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => setDone(true), 2600);
    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    if (done) {
      router.replace('/home');
    }
  }, [done]);

  return (
    <LinearGradient
      colors={[colors.backgroundStart, colors.backgroundMid, colors.backgroundEnd]}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoCircle}>
          <Hand size={64} color={colors.primary} strokeWidth={1.8} />
        </View>
        <Text style={styles.title}>SignBridge</Text>
        <Text style={styles.subtitle}>Smart Glove Translation</Text>
      </Animated.View>

      <View style={styles.dotsRow}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </LinearGradient>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { alignItems: 'center' },
    logoCircle: {
      width: 132,
      height: 132,
      borderRadius: 36,
      backgroundColor: colors.primarySoft,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 28,
    },
    title: { fontSize: 36, fontWeight: '800', color: colors.textMain, letterSpacing: 0.5 },
    subtitle: { fontSize: 15, color: colors.textDescription, marginTop: 8, fontWeight: '500' },
    dotsRow: { flexDirection: 'row', position: 'absolute', bottom: 80, gap: 8 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.cardBorder },
    dotActive: { width: 20, backgroundColor: colors.primary },
  });
