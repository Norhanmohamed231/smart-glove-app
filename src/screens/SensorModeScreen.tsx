import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bluetooth, Activity } from 'lucide-react-native';
import { THEME } from '@/src/theme/theme';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { useActiveMode } from '@/src/hooks/useGlovePipeline';
import { useAppStore } from '@/src/store/useAppStore';
import { gesturePipeline } from '@/src/features/pipeline';
import { FLEX_THRESHOLD } from '@/src/features/binary/constants';

const FINGER_KEYS = ['thumb', 'index', 'middle', 'ring', 'pinky'] as const;
const FINGER_LABELS = ['F1 Thumb', 'F2 Index', 'F3 Middle', 'F4 Ring', 'F5 Pinky'];

export default function SensorModeScreen() {
  useActiveMode('sensor');

  const connectionState = useAppStore((s) => s.connectionState);
  const latestFrame = useAppStore((s) => s.latestFrame);
  const isConnected = connectionState === 'connected';
  const bufferSize = gesturePipeline.getLstmProcessor().getBuffer().length;

  return (
    <LinearGradient colors={[THEME.colors.backgroundStart, THEME.colors.backgroundMid]} style={styles.container}>
      <ScreenHeader title="Sensor Glove" />
      <ScrollView contentContainerStyle={styles.innerContainer}>
        <View style={styles.statusPanel}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Bluetooth color={isConnected ? THEME.colors.greenNeon : THEME.colors.textMuted} size={20} />
            <Text style={styles.statusText}>
              {isConnected ? `Hardware: Connected` : 'Hardware: Disconnected'}
            </Text>
          </View>
          <Activity color={THEME.colors.cyanNeon} size={20} />
        </View>

        <View style={styles.predictionBox}>
          <LinearGradient colors={['#1F2347', '#141736']} style={StyleSheet.absoluteFillObject} />
          <Text style={styles.predictionLabel}>LIVE AI TRANSLATION</Text>
          <Text style={styles.predictionOutput}>Phase 2</Text>
          <Text style={styles.subtitle}>LSTM model integration coming soon</Text>
        </View>

        <View style={styles.previewBox}>
          <Text style={styles.previewTitle}>LIVE FLEX PREVIEW</Text>
          <Text style={styles.bufferText}>Buffer: {bufferSize}/20 frames</Text>
          {FINGER_KEYS.map((key, index) => {
            const value = latestFrame?.flex[key] ?? 0;
            const pct = Math.min(100, (value / 4095) * 100);
            const bent = value >= FLEX_THRESHOLD;
            return (
              <View key={key} style={styles.flexRow}>
                <Text style={styles.flexLabel}>{FINGER_LABELS[index]}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: bent ? THEME.colors.greenNeon : THEME.colors.cyanNeon }]} />
                </View>
                <Text style={styles.flexValue}>{value}</Text>
              </View>
            );
          })}
          {!latestFrame && (
            <Text style={styles.noStream}>No live stream. Connect glove from Home.</Text>
          )}
        </View>

        <View style={[styles.btnStart, styles.btnDisabled]}>
          <Text style={styles.btnText}>START ENGINE — PHASE 2</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40 },
  statusPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  statusText: { color: THEME.colors.textMain, marginLeft: 10, fontSize: 14, fontWeight: '500' },
  predictionBox: {
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  predictionLabel: { color: THEME.colors.cyanNeon, fontSize: 11, fontWeight: '700', letterSpacing: 3, marginBottom: 8 },
  predictionOutput: { color: THEME.colors.textMain, fontSize: 32, fontWeight: '900' },
  subtitle: { color: THEME.colors.textMuted, marginTop: 8, fontSize: 13 },
  previewBox: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  previewTitle: { color: THEME.colors.cyanNeon, fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  bufferText: { color: THEME.colors.textMuted, fontSize: 12, marginBottom: 12 },
  flexRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  flexLabel: { color: THEME.colors.textDescription, width: 72, fontSize: 11 },
  barTrack: { flex: 1, height: 8, backgroundColor: '#16172B', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  flexValue: { color: THEME.colors.textMain, width: 42, textAlign: 'right', fontSize: 12 },
  noStream: { color: THEME.colors.textMuted, fontSize: 13, marginTop: 8 },
  btnStart: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
  },
  btnDisabled: { opacity: 0.45 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
