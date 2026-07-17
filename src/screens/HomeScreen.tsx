import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Bluetooth, BatteryMedium, Menu, Moon, Sun, Play, History as HistoryIcon } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { ThemeColors } from '@/src/theme/theme';
import { DeviceScanModal } from '@/src/components/DeviceScanModal';
import { HomeMenuModal } from '@/src/components/HomeMenuModal';
import { useBluetoothControls } from '@/src/hooks/useGlovePipeline';
import { useAppStore } from '@/src/store/useAppStore';

export default function HomeScreen() {
  const { colors, mode, toggleTheme } = useTheme();
  const styles = createStyles(colors);

  const { scan, connect, disconnect, isSupported } = useBluetoothControls();
  const connectionState = useAppStore((s) => s.connectionState);
  const battery = useAppStore((s) => s.battery);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const isConnected = connectionState === 'connected';

  const handleManageConnection = async () => {
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
        'Allow Nearby devices / Bluetooth permissions for signTalker in system settings, confirm Bluetooth is on, then scan again.',
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

  return (
    <LinearGradient
      colors={[colors.backgroundStart, colors.backgroundMid, colors.backgroundEnd]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={() => setMenuVisible(true)}
          >
            <Menu size={22} color={colors.textMain} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7} onPress={toggleTheme}>
            {mode === 'light' ? (
              <Moon size={20} color={colors.textMain} />
            ) : (
              <Sun size={20} color={colors.textMain} />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity activeOpacity={0.85} onPress={handleManageConnection}>
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusLabelWrap}>
                <Text style={styles.statusLabel}>Glove Status</Text>
                <View style={styles.statusValueRow}>
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: isConnected ? colors.success : colors.textMuted },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusValue,
                      { color: isConnected ? colors.success : colors.textDescription },
                    ]}
                  >
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </Text>
                </View>
              </View>
              <Bluetooth size={22} color={colors.primary} />
            </View>

            <View style={styles.divider} />

            <View style={styles.statusRow}>
              <View style={styles.statusLabelWrap}>
                <Text style={styles.statusLabel}>Battery</Text>
                <Text style={styles.statusValue}>{battery}%</Text>
              </View>
              <BatteryMedium size={24} color={colors.success} />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/choose-mode')}>
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryButton}
          >
            <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Start Translation</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.secondaryButton}
          onPress={() => router.push('/history')}
        >
          <HistoryIcon size={20} color={colors.textMain} />
          <Text style={styles.secondaryButtonText}>View History</Text>
        </TouchableOpacity>
      </ScrollView>

      <HomeMenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onManageConnection={handleManageConnection}
      />

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

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statusCard: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      padding: 22,
      marginBottom: 28,
    },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statusLabelWrap: { gap: 6 },
    statusLabel: { color: colors.textDescription, fontSize: 14, fontWeight: '500' },
    statusValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    statusValue: { color: colors.textMain, fontSize: 18, fontWeight: '700' },
    dot: { width: 9, height: 9, borderRadius: 5 },
    divider: { height: 1, backgroundColor: colors.cardBorder, marginVertical: 18 },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: 18,
      borderRadius: 18,
      marginBottom: 16,
    },
    primaryButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: 18,
      borderRadius: 18,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    secondaryButtonText: { color: colors.textMain, fontSize: 16, fontWeight: '600' },
  });
