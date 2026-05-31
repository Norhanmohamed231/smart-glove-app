import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bluetooth } from 'lucide-react-native';
import { THEME } from '../theme/theme';
import { GlassCard } from './GlassCard';
import { useAppStore } from '../store/useAppStore';

interface ConnectionPanelProps {
  onScanPress: () => void;
}

export function ConnectionPanel({ onScanPress }: ConnectionPanelProps) {
  const connectionState = useAppStore((s) => s.connectionState);
  const deviceName = useAppStore((s) => s.connectedDeviceName);

  const isConnected = connectionState === 'connected';
  const statusLabel =
    connectionState === 'connected'
      ? 'Connected'
      : connectionState === 'connecting'
        ? 'Connecting...'
        : connectionState === 'scanning'
          ? 'Scanning...'
          : connectionState === 'error'
            ? 'Connection Error'
            : 'Disconnected';

  const dotColor = isConnected ? THEME.colors.greenNeon : THEME.colors.textMuted;

  return (
    <GlassCard gradientColors={['rgba(0, 242, 254, 0.08)', 'rgba(79, 172, 254, 0.04)']}>
      <View style={styles.header}>
        <Bluetooth color={THEME.colors.cyanNeon} size={20} />
        <Text style={styles.title}>GLOVE CONNECTION</Text>
      </View>

      <View style={styles.statusRow}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <Text style={styles.statusText}>{statusLabel}</Text>
      </View>

      <Text style={styles.deviceText}>Device: {deviceName ?? '—'}</Text>

      <TouchableOpacity style={styles.button} onPress={onScanPress} activeOpacity={0.8}>
        <Text style={styles.buttonText}>{isConnected ? 'Manage Connection' : 'Scan & Connect'}</Text>
      </TouchableOpacity>

      {!isConnected && (
        <Text style={styles.hint}>Connect glove to enable Binary Mode on Android.</Text>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  title: { color: THEME.colors.cyanNeon, fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { color: THEME.colors.textMain, fontSize: 15, fontWeight: '600' },
  deviceText: { color: THEME.colors.textDescription, fontSize: 14, marginBottom: 16 },
  button: {
    backgroundColor: 'rgba(0, 242, 254, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: { color: THEME.colors.cyanNeon, fontWeight: '700', fontSize: 14 },
  hint: { color: THEME.colors.textMuted, fontSize: 12, marginTop: 12 },
});
