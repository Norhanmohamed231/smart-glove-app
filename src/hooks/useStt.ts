import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { useAppStore } from '@/src/store/useAppStore';
import { sttService } from '@/src/features/stt/SttService';
import {
  openGoogleVoiceSettings,
  triggerNativeArabicPackDownload,
} from '@/src/features/stt/SttPackInstaller';
import type { SttMode, SttResult, SttStatus } from '@/src/features/stt/types';
import {
  STT_ON_DEVICE_HINT_AR,
  STT_ONLINE_HINT_AR,
  STT_PACK_DOWNLOAD_OK_AR,
  STT_PACK_DOWNLOADING_AR,
  STT_PACK_OPEN_SETTINGS_AR,
} from '@/src/features/stt/types';

export function useStt() {
  const addHistory = useAppStore((s) => s.addHistory);

  const [status, setStatus] = useState<SttStatus>('unchecked');
  const [mode, setMode] = useState<SttMode | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isInstallingPack, setIsInstallingPack] = useState(false);
  const [phrase, setPhrase] = useState('');
  const [accuracy, setAccuracy] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isAvailable = status === 'available';
  const isChecking = status === 'checking' || status === 'unchecked';
  const packInstalled = mode === 'on_device';
  const showInstallPack = isAvailable && mode === 'online';

  const refreshAvailability = useCallback(async () => {
    const availability = await sttService.checkAvailability();
    setStatus(availability.status);
    setMode(availability.mode);
    if (availability.infoMessage) {
      setInfo(availability.infoMessage);
    }
    if (availability.errorMessage) {
      setError(availability.errorMessage);
    } else if (availability.status === 'available') {
      setError(null);
    }
    return availability;
  }, []);

  useEffect(() => {
    sttService.setCallbacks(
      (result: SttResult) => {
        setPhrase(result.arabic);
        setAccuracy(result.confidence);
        setError(null);

        if (result.isFinal && result.arabic) {
          addHistory({
            arabic: result.arabic,
            english: '—',
            source: 'Speech',
          });
        }
      },
      (_code, message) => {
        if (message) setError(message);
      },
      (listening) => {
        setIsListening(listening);
      },
      (message) => {
        if (message) setInfo(message);
      },
    );

    void refreshAvailability();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refreshAvailability();
      }
    });

    return () => {
      sttService.abortListening();
      sttService.clearCallbacks();
      sub.remove();
    };
  }, [addHistory, refreshAvailability]);

  const toggleListening = useCallback(async () => {
    if (isListening) {
      sttService.stopListening();
      return;
    }

    setError(null);
    setInfo(null);
    setPhrase('');

    if (!isAvailable || isChecking) {
      await refreshAvailability();
    }

    await sttService.startListening();
  }, [isAvailable, isChecking, isListening, refreshAvailability]);

  const installOfflinePack = useCallback(async () => {
    setIsInstallingPack(true);
    setError(null);
    setInfo(STT_PACK_DOWNLOADING_AR);

    const result = await triggerNativeArabicPackDownload();

    if (result === 'success') {
      await refreshAvailability();
      setInfo(STT_PACK_DOWNLOAD_OK_AR);
      setIsInstallingPack(false);
      return;
    }

    if (result === 'dialog') {
      setInfo(STT_PACK_OPEN_SETTINGS_AR);
      setIsInstallingPack(false);
      return;
    }

    const opened = await openGoogleVoiceSettings();
    setInfo(opened ? STT_PACK_OPEN_SETTINGS_AR : STT_PACK_OPEN_SETTINGS_AR);
    setIsInstallingPack(false);
  }, [refreshAvailability]);

  const modeHint =
    mode === 'online' ? STT_ONLINE_HINT_AR : mode === 'on_device' ? STT_ON_DEVICE_HINT_AR : null;

  return {
    isListening,
    isAvailable,
    isChecking,
    isInstallingPack,
    packInstalled,
    showInstallPack,
    mode,
    modeHint,
    phrase,
    accuracy,
    error,
    info,
    toggleListening,
    installOfflinePack,
    refreshAvailability,
  };
}
