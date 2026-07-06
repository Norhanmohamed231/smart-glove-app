import { Platform } from 'react-native';
import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';
import { GloveDataParser } from '../parser/GloveDataParser';
import type { BluetoothDeviceInfo, ConnectionState } from '../parser/types';
import { gloveFrameStream } from '../pipeline/GloveFrameStream';
import { ensureBluetoothPermissions } from './bluetoothPermissions';
import { GLOVE_DEVICE_NAME } from './constants';

type ConnectionListener = (state: ConnectionState, deviceName?: string) => void;

class BluetoothService {
  private parser = new GloveDataParser();
  private connectionState: ConnectionState = 'disconnected';
  private connectedDevice: BluetoothDevice | null = null;
  private readSubscription: { remove: () => void } | null = null;
  private connectionListeners = new Set<ConnectionListener>();

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  getConnectedDeviceName(): string | null {
    return this.connectedDevice?.name ?? null;
  }

  isSupported(): boolean {
    return Platform.OS === 'android';
  }

  onConnectionChange(listener: ConnectionListener): () => void {
    this.connectionListeners.add(listener);
    listener(this.connectionState, this.connectedDevice?.name);
    return () => this.connectionListeners.delete(listener);
  }

  private setConnectionState(state: ConnectionState, deviceName?: string): void {
    this.connectionState = state;
    for (const listener of this.connectionListeners) {
      listener(state, deviceName);
    }
  }

  private async ensureReady(): Promise<'ok' | 'permissions_denied' | 'bluetooth_off'> {
    const permissionStatus = await ensureBluetoothPermissions();
    if (permissionStatus !== 'granted') {
      return 'permissions_denied';
    }

    const enabled = await RNBluetoothClassic.isBluetoothEnabled();
    if (enabled) {
      return 'ok';
    }

    try {
      await RNBluetoothClassic.requestBluetoothEnabled();
    } catch {
      // User dismissed the system enable dialog.
    }

    const enabledAfterPrompt = await RNBluetoothClassic.isBluetoothEnabled();
    return enabledAfterPrompt ? 'ok' : 'bluetooth_off';
  }

  async scanForDevices(): Promise<BluetoothDeviceInfo[]> {
    if (!this.isSupported()) return [];

    this.setConnectionState('scanning');

    try {
      const ready = await this.ensureReady();
      if (ready === 'permissions_denied') {
        this.setConnectionState('error');
        return [];
      }
      if (ready === 'bluetooth_off') {
        this.setConnectionState('error');
        return [];
      }

      const bonded = await RNBluetoothClassic.getBondedDevices();
      let discovered: BluetoothDevice[] = [];

      try {
        discovered = await RNBluetoothClassic.startDiscovery();
      } catch {
        discovered = [];
      }

      const merged = new Map<string, BluetoothDevice>();
      [...bonded, ...discovered].forEach((device) => {
        merged.set(device.address, device);
      });

      const devices = Array.from(merged.values())
        .filter((device) => {
          const name = (device.name ?? '').toLowerCase();
          return name.includes('signglove') || name.includes('sign') || name.includes('esp32');
        })
        .map((device) => ({
          id: device.address,
          name: device.name ?? GLOVE_DEVICE_NAME,
          address: device.address,
        }));

      this.setConnectionState(this.connectedDevice ? 'connected' : 'disconnected', this.connectedDevice?.name);
      return devices;
    } catch {
      this.setConnectionState('error');
      return [];
    }
  }

  async connect(deviceId: string): Promise<boolean> {
    if (!this.isSupported()) return false;

    this.setConnectionState('connecting');

    try {
      const ready = await this.ensureReady();
      if (ready !== 'ok') {
        this.setConnectionState('error');
        return false;
      }

      if (this.connectedDevice) {
        await this.disconnect();
      }

      this.parser.reset();
      const device = await RNBluetoothClassic.connectToDevice(deviceId, {
        delimiter: '\r',
      });

      this.connectedDevice = device;
      this.readSubscription = device.onDataReceived((event) => {
        const chunk = typeof event.data === 'string' ? event.data : String(event.data);
        const frames = this.parser.pushChunk(chunk);
        for (const frame of frames) {
          gloveFrameStream.emit(frame);
        }
      });

      this.setConnectionState('connected', device.name ?? GLOVE_DEVICE_NAME);
      return true;
    } catch {
      this.connectedDevice = null;
      this.setConnectionState('error');
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.readSubscription) {
      this.readSubscription.remove();
      this.readSubscription = null;
    }

    if (this.connectedDevice) {
      try {
        await RNBluetoothClassic.disconnectFromDevice(this.connectedDevice.address);
      } catch {
        // ignore disconnect errors
      }
    }

    this.connectedDevice = null;
    this.parser.reset();
    this.setConnectionState('disconnected');
  }
}

export const bluetoothService = new BluetoothService();
