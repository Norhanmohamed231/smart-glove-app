import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';
import { THEME } from '@/src/theme/theme';

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [done, setDone] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => setDone(true), 3000);
    return () => clearTimeout(timer);
  }, [fadeAnim]);

  useEffect(() => {
    if (done) {
      router.replace('/home');
    }
  }, [done]);

  return (
    <LinearGradient colors={[THEME.colors.backgroundStart, THEME.colors.backgroundMid]} style={styles.container}>
      <Animated.View style={[styles.splashContent, { opacity: fadeAnim }]}>
        <View style={styles.logoContainer}>
          <LinearGradient colors={[THEME.colors.cyanNeon, '#4FACFE', 'transparent']} style={styles.logoGlow} />
          <Sparkles size={64} color={THEME.colors.cyanNeon} />
        </View>
        <Text style={styles.splashTitle}>SignBridge</Text>
        <Text style={styles.splashSubtitle}>THE AI GESTURE INTERFACES</Text>
        <View style={styles.loadingTrack}>
          <LinearGradient
            colors={[THEME.colors.cyanNeon, THEME.colors.purpleNeon]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.loadingBar}
          />
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  splashContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { width: 140, height: 140, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  logoGlow: { position: 'absolute', width: 200, height: 200, borderRadius: 100, opacity: 0.15 },
  splashTitle: { fontSize: 38, fontWeight: '900', color: THEME.colors.textMain, letterSpacing: 2 },
  splashSubtitle: { fontSize: 12, color: THEME.colors.textMuted, letterSpacing: 4, marginTop: 8, marginBottom: 48, fontWeight: '600' },
  loadingTrack: { width: 180, height: 4, backgroundColor: '#1E2243', borderRadius: 2, overflow: 'hidden' },
  loadingBar: { width: '65%', height: '100%' },
});
