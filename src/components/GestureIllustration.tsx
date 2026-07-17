import React from 'react';
import { StyleSheet, View } from 'react-native';
import { getGestureIllustration } from '@/src/features/binary/gestureIllustrations';

interface GestureIllustrationProps {
  bits: string;
  size?: number;
}

export function GestureIllustration({ bits, size = 72 }: GestureIllustrationProps) {
  const Illustration = getGestureIllustration(bits);

  if (!Illustration) {
    return <View style={[styles.placeholder, { width: size, height: size }]} />;
  }

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Illustration width={size} height={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    borderRadius: 14,
  },
  placeholder: {
    borderRadius: 14,
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
  },
});
