import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassCardProps {
  children: React.ReactNode;
  gradientColors: readonly [string, string, ...string[]];
}

export function GlassCard({ children, gradientColors }: GlassCardProps) {
  return (
    <View style={styles.cardWrapper}>
      <View style={styles.glassCard}>
        <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFillObject} />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  glassCard: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255,  0.03)',
  },
});
