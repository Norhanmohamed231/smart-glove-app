import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bluetooth, Activity, Zap, Play, Square, Volume2 } from 'lucide-react-native';
import { THEME } from '../theme';
export default function SensorModeScreen() {
  const [isDetecting, setIsDetecting] = useState(false);

  return (
    <LinearGradient colors={[THEME.colors.backgroundStart, THEME.colors.backgroundMid]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.innerContainer}>
        <View style={styles.statusPanel}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Bluetooth color={THEME.colors.greenNeon} size={20} />
            <Text style={styles.statusText}>Hardware: Connected</Text>
          </View>
          <Activity color={THEME.colors.cyanNeon} size={20} />
        </View>

        <View style={styles.predictionBox}>
          <LinearGradient colors={['#1F2347', '#141736']} style={StyleSheet.absoluteFillObject} />
          <Text style={styles.predictionLabel}>LIVE AI TRANSLATION</Text>
          <Text style={styles.predictionOutput}>{isDetecting ? 'HELLO WORLD' : 'IDLE'}</Text>
          <View style={styles.confidenceContainer}>
            <Zap color={THEME.colors.cyanNeon} size={14} />
            <Text style={styles.confidenceText}>Confidence: {isDetecting ? '98.4%' : '--'}</Text>
          </View>
        </View>

        <View style={styles.controlRow}>
          <TouchableOpacity 
            style={isDetecting ? styles.btnStop : styles.btnStart} 
            onPress={() => setIsDetecting(!isDetecting)}
          >
            {isDetecting ? <Square color="#fff" size={20} fill="#fff" /> : <Play color="#fff" size={20} fill="#fff" />}
            <Text style={styles.btnText}>{isDetecting ? 'STOP ENGINE' : 'START ENGINE'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.speechCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.speechLabel}>CONSOLIDATED TEXT</Text>
            <Text style={styles.speechStream}>{isDetecting ? 'Hello world, I am using SignBridge.' : 'No active stream.'}</Text>
          </View>
          <TouchableOpacity style={styles.ttsButton}>
            <Volume2 color={THEME.colors.cyanNeon} size={24} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { paddingHorizontal: 24, paddingTop: 20 },
  statusPanel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: THEME.colors.cardBorder, padding: 16, borderRadius: 16, marginBottom: 24 },
  statusText: { color: THEME.colors.textMain, marginLeft: 10, fontSize: 14, fontWeight: '500' },
  predictionBox: { height: 180, borderRadius: 24, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: THEME.colors.cardBorder },
  predictionLabel: { color: THEME.colors.cyanNeon, fontSize: 11, fontWeight: '700', letterSpacing: 3, marginBottom: 12 },
  predictionOutput: { color: THEME.colors.textMain, fontSize: 36, fontWeight: '900' },
  confidenceContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 16, backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  confidenceText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginLeft: 4 },
  controlRow: { marginBottom: 24 },
  btnStart: { backgroundColor: '#007AFF', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 18, borderRadius: 16 },
  btnStop: { backgroundColor: THEME.colors.error, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 18, borderRadius: 16 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15, marginLeft: 8 },
  speechCard: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: THEME.colors.cardBorder, padding: 20, borderRadius: 20, alignItems: 'center' },
  speechLabel: { color: THEME.colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
  speechStream: { color: THEME.colors.textMain, fontSize: 16, fontWeight: '500' },
  ttsButton: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(0, 242, 254, 0.2)', backgroundColor: 'rgba(0, 242, 254, 0.1)', justifyContent: 'center', alignItems: 'center', marginLeft: 16 },
});