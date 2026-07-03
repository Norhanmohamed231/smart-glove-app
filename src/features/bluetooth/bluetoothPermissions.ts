import { PermissionsAndroid, Platform } from 'react-native';

export type BluetoothPermissionStatus = 'granted' | 'denied' | 'unsupported';

/**
 * Android 12+ requires runtime BLUETOOTH_CONNECT / BLUETOOTH_SCAN.
 * Older versions need location for Classic device discovery.
 */
export async function ensureBluetoothPermissions(): Promise<BluetoothPermissionStatus> {
  if (Platform.OS !== 'android') {
    return 'unsupported';
  }

  const apiLevel = typeof Platform.Version === 'number' ? Platform.Version : 0;

  if (apiLevel >= 31) {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    ]);

    const connect = results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT];
    const scan = results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN];

    return connect === PermissionsAndroid.RESULTS.GRANTED &&
      scan === PermissionsAndroid.RESULTS.GRANTED
      ? 'granted'
      : 'denied';
  }

  const location = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Location permission',
      message:
        'signTalker needs location access to discover nearby Bluetooth gloves (required by Android for device scanning).',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
  );

  return location === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
}
