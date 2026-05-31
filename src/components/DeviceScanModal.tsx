import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { THEME } from '../theme/theme';
import { useAppStore } from '../store/useAppStore';
import type { BluetoothDeviceInfo } from '../features/parser/types';

interface DeviceScanModalProps {
  visible: boolean;
  onClose: () => void;
  onConnect: (deviceId: string) => void;
  onDisconnect: () => void;
  isScanning: boolean;
}

export function DeviceScanModal({
  visible,
  onClose,
  onConnect,
  onDisconnect,
  isScanning,
}: DeviceScanModalProps) {
  const devices = useAppStore((s) => s.scannedDevices);
  const connectionState = useAppStore((s) => s.connectionState);
  const isConnected = connectionState === 'connected';

  const renderItem = ({ item }: { item: BluetoothDeviceInfo }) => (
    <View style={styles.deviceRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.deviceName}>{item.name}</Text>
        <Text style={styles.deviceAddress}>{item.address}</Text>
      </View>
      <TouchableOpacity style={styles.connectBtn} onPress={() => onConnect(item.id)}>
        <Text style={styles.connectBtnText}>Connect</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Available Devices</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {isScanning ? (
            <View style={styles.centerRow}>
              <ActivityIndicator color={THEME.colors.cyanNeon} />
              <Text style={styles.scanningText}>Scanning...</Text>
            </View>
          ) : devices.length === 0 ? (
            <Text style={styles.emptyText}>
              No SignGlove devices found. Pair the glove in Android Bluetooth settings, then scan again.
            </Text>
          ) : (
            <FlatList
              data={devices}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              style={{ maxHeight: 280 }}
            />
          )}

          {isConnected && (
            <TouchableOpacity style={styles.disconnectBtn} onPress={onDisconnect}>
              <Text style={styles.disconnectText}>Disconnect</Text>
            </TouchableOpacity>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: '#12142A',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: { color: THEME.colors.textMain, fontSize: 18, fontWeight: '700' },
  closeText: { color: THEME.colors.textMuted, fontSize: 20, padding: 4 },
  centerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 20 },
  scanningText: { color: THEME.colors.textDescription },
  emptyText: { color: THEME.colors.textMuted, lineHeight: 20, paddingVertical: 12 },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.cardBorder,
  },
  deviceName: { color: THEME.colors.textMain, fontWeight: '600', fontSize: 15 },
  deviceAddress: { color: THEME.colors.textMuted, fontSize: 12, marginTop: 2 },
  connectBtn: {
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  connectBtnText: { color: THEME.colors.cyanNeon, fontWeight: '700' },
  disconnectBtn: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.4)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  disconnectText: { color: THEME.colors.error, fontWeight: '700' },
});
