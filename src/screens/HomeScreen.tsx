import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Binary, Cpu } from 'lucide-react-native';
import { THEME } from '@/src/theme/theme';
import { GlassCard } from '@/src/components/GlassCard';
import { ConnectionPanel } from '@/src/components/ConnectionPanel';
import { DeviceScanModal } from '@/src/components/DeviceScanModal';
import { useBluetoothControls } from '@/src/hooks/useGlovePipeline';
import { useAppStore } from '@/src/store/useAppStore';

export default function HomeScreen() {
  const { scan, connect, disconnect, isSupported } = useBluetoothControls();
  const connectionState = useAppStore((s) => s.connectionState);
  const [modalVisible, setModalVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const isConnected = connectionState === 'connected';

  const handleScanPress = async () => {
    if (!isSupported) {
      Alert.alert('Android Required', 'Bluetooth Classic glove connection is supported on Android only.');
      setModalVisible(true);
      return;
    }
    setModalVisible(true);
    setIsScanning(true);
    const devices = await scan();
    setIsScanning(false);

    const stateAfterScan = useAppStore.getState().connectionState;
    if (stateAfterScan === 'error') {
      Alert.alert(
        'Bluetooth unavailable',
        'Allow Nearby devices / Bluetooth permissions for SignBridge in system settings, confirm Bluetooth is on, then scan again.',
      );
      return;
    }

    if (devices.length === 0) {
      Alert.alert(
        'Permissions or pairing',
        'If no devices appear: allow Bluetooth permissions when prompted, pair the SignGlove in Android Bluetooth settings, then tap Scan again.',
      );
    }
  };

  const handleConnect = async (deviceId: string) => {
    const ok = await connect(deviceId);
    if (!ok) {
      Alert.alert('Connection Failed', 'Could not connect to the glove. Ensure it is paired and powered on.');
    }
  };

  const handleBinaryPress = () => {
    if (isSupported && !isConnected) {
      Alert.alert('Connect Glove', 'Connect the SignGlove from the connection panel first.');
      return;
    }
    router.push('/binary-mode');
  };

  return (
    <LinearGradient
      colors={[THEME.colors.backgroundStart, THEME.colors.backgroundMid, THEME.colors.backgroundEnd]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeSub}>SYSTEM ONLINE</Text>
          <Text style={styles.welcomeMain}>Select Interface</Text>
        </View>

        <ConnectionPanel onScanPress={handleScanPress} />

        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/sensor-mode')}>
          <GlassCard gradientColors={['rgba(0, 242, 254, 0.12)', 'rgba(79, 172, 254, 0.05)']}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconFrame, { borderColor: THEME.colors.cyanNeon }]}>
                <Cpu color={THEME.colors.cyanNeon} size={32} />
              </View>
              <View style={styles.badgeOnline}>
                <View style={[styles.dot, { backgroundColor: THEME.colors.greenNeon }]} />
                <Text style={styles.badgeText}>PHASE 2</Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>Sensor-Based Mode</Text>
            <Text style={styles.cardDesc}>
              Live flex preview from glove. LSTM AI translation will run on-device in Phase 2.
            </Text>
            <Text style={[styles.actionText, { color: THEME.colors.cyanNeon }]}>Open Sensor Mode →</Text>
          </GlassCard>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} onPress={handleBinaryPress}>
          <GlassCard gradientColors={['rgba(155, 81, 224, 0.12)', 'rgba(224, 170, 255, 0.05)']}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconFrame, { borderColor: THEME.colors.purpleNeon }]}>
                <Binary color={THEME.colors.purpleNeon} size={32} />
              </View>
              <View style={styles.badgeOnline}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: isConnected || !isSupported ? THEME.colors.greenNeon : THEME.colors.textMuted },
                  ]}
                />
                <Text style={styles.badgeText}>{isConnected || !isSupported ? 'READY' : 'LOCKED'}</Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>Binary Custom Mode</Text>
            <Text style={styles.cardDesc}>
              5-bit live gesture mapping with Arabic dictionary and on-device speech.
            </Text>
            <Text style={[styles.actionText, { color: THEME.colors.purpleNeon }]}>Boot Binary Engine →</Text>
          </GlassCard>
        </TouchableOpacity>
      </ScrollView>

      <DeviceScanModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConnect={handleConnect}
        onDisconnect={async () => {
          await disconnect();
        }}
        isScanning={isScanning}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  welcomeContainer: { marginBottom: 24 },
  welcomeSub: { color: THEME.colors.greenNeon, fontSize: 12, fontWeight: '700', letterSpacing: 3, marginBottom: 6 },
  welcomeMain: { color: THEME.colors.textMain, fontSize: 32, fontWeight: '800' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  iconFrame: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000020',
  },
  badgeOnline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 12,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText: { color: THEME.colors.textMain, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  cardTitle: { color: THEME.colors.textMain, fontSize: 22, fontWeight: '700', marginBottom: 8 },
  cardDesc: { color: THEME.colors.textDescription, fontSize: 14, lineHeight: 20, marginBottom: 20 },
  actionText: { fontSize: 14, fontWeight: '600' },
});
