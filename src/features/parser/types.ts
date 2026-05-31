export type AppMode = 'binary' | 'sensor';
export type InputSource = 'glove' | 'manual';
export type ConnectionState = 'disconnected' | 'scanning' | 'connecting' | 'connected' | 'error';

export interface GloveFlex {
  thumb: number;
  index: number;
  middle: number;
  ring: number;
  pinky: number;
}

export interface GloveFrame {
  timestamp: number;
  flex: GloveFlex;
  imu: {
    ax: number;
    ay: number;
    az: number;
    gx: number;
    gy: number;
    gz: number;
  };
  orientation: {
    pitch: number;
    roll: number;
  };
}

export interface GestureResult {
  mode: AppMode;
  label: string;
  confidence?: number;
  bits?: string;
  phrase?: string;
  isStable: boolean;
}

export interface BluetoothDeviceInfo {
  id: string;
  name: string;
  address: string;
}
