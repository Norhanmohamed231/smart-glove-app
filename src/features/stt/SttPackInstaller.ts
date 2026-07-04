import { Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

const ARABIC_LOCALES = ['ar-EG', 'ar-SA'] as const;

const GOOGLE_VOICE_COMPONENTS = [
  {
    packageName: 'com.google.android.googlequicksearchbox',
    className: 'com.google.android.apps.gsa.settingsui.VoiceSearchPreferences',
  },
  {
    packageName: 'com.google.android.googlequicksearchbox',
    className: 'com.google.android.apps.gsa.velvet.ui.settings.VoiceSearchPreferences',
  },
  {
    packageName: 'com.google.android.voicesearch',
    className: 'com.google.android.voicesearch.VoiceSearchPreferences',
  },
] as const;

export async function checkNativeArabicPackSupport(): Promise<{
  autoDownloadSupported: boolean;
  installed: boolean;
  canAutoDownload: boolean;
}> {
  if (Platform.OS !== 'android') {
    return { autoDownloadSupported: false, installed: false, canAutoDownload: false };
  }

  const androidApi =
    typeof Platform.Version === 'number'
      ? Platform.Version
      : parseInt(String(Platform.Version), 10) || 0;

  if (androidApi < 33) {
    return { autoDownloadSupported: false, installed: false, canAutoDownload: false };
  }

  try {
    const { installedLocales } = await ExpoSpeechRecognitionModule.getSupportedLocales({
      androidRecognitionServicePackage: 'com.google.android.as',
    });

    const installed = installedLocales.some((tag) => tag.toLowerCase().startsWith('ar'));
    if (installed) {
      return { autoDownloadSupported: true, installed: true, canAutoDownload: false };
    }

    const { locales } = await ExpoSpeechRecognitionModule.getSupportedLocales({
      androidRecognitionServicePackage: 'com.google.android.googlequicksearchbox',
    });

    const canDownload = locales.some((tag) => tag.toLowerCase().startsWith('ar'));
    return {
      autoDownloadSupported: true,
      installed: false,
      canAutoDownload: canDownload,
    };
  } catch {
    return { autoDownloadSupported: true, installed: false, canAutoDownload: true };
  }
}

export async function triggerNativeArabicPackDownload(): Promise<
  'success' | 'dialog' | 'unsupported' | 'failed'
> {
  if (Platform.OS !== 'android') return 'unsupported';

  const androidApi =
    typeof Platform.Version === 'number'
      ? Platform.Version
      : parseInt(String(Platform.Version), 10) || 0;

  if (androidApi < 33) return 'unsupported';

  for (const locale of ARABIC_LOCALES) {
    try {
      const result = await ExpoSpeechRecognitionModule.androidTriggerOfflineModelDownload({
        locale,
      });

      if (result.status === 'download_success' || result.status === 'opened_dialog') {
        return result.status === 'download_success' ? 'success' : 'dialog';
      }
    } catch {
      // try next locale
    }
  }

  return 'failed';
}

export async function openGoogleVoiceSettings(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;

  for (const component of GOOGLE_VOICE_COMPONENTS) {
    try {
      await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
        packageName: component.packageName,
        className: component.className,
        flags: 1 << 28,
      });
      return true;
    } catch {
      // try next component
    }
  }

  try {
    await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.VOICE_INPUT_SETTINGS);
    return true;
  } catch {
    return false;
  }
}
