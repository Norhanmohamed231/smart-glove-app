import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { useAppStore } from '@/src/store/useAppStore';
import { sttService } from '@/src/features/stt/SttService';
import type { SttMode, SttResult, SttStatus } from '@/src/features/stt/types';

export function useStt() {
  const addHistory = useAppStore((s) => s.addHistory);

  const [status, setStatus] = useState<SttStatus>('unchecked');
  const [mode, setMode] = useState<SttMode | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [phrase, setPhrase] = useState('');
  const [accuracy, setAccuracy] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const isAvailable = status === 'available';
  const isChecking = status === 'checking' || status === 'unchecked';

  const refreshAvailability = useCallback(async () => {
    const availability = await sttService.checkAvailability();
    setStatus(availability.status);
    setMode(availability.mode);
    if (availability.errorMessage) {
      setError(availability.errorMessage);
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
    );

    void refreshAvailability();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && !sttService.isListening()) {
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

    if (!isAvailable || isChecking) {
      const availability = await refreshAvailability();
      if (availability.status !== 'available') return;
    }

    setPhrase('');

    await sttService.startListening();
  }, [isAvailable, isChecking, isListening, refreshAvailability]);

  return {
    isListening,
    isAvailable,
    isChecking,
    mode,
    phrase,
    accuracy,
    error,
    toggleListening,
    refreshAvailability,
  };
}
