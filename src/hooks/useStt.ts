import { useCallback, useEffect, useState } from 'react';

import { useAppStore } from '@/src/store/useAppStore';
import { sttService } from '@/src/features/stt/SttService';
import type { SttResult, SttStatus } from '@/src/features/stt/types';

export function useStt() {
  const addHistory = useAppStore((s) => s.addHistory);

  const [status, setStatus] = useState<SttStatus>('unchecked');
  const [isListening, setIsListening] = useState(false);
  const [phrase, setPhrase] = useState('');
  const [accuracy, setAccuracy] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const isAvailable = status === 'available';
  const isChecking = status === 'checking' || status === 'unchecked';

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

    void sttService.checkAvailability().then((availability) => {
      setStatus(availability.status);
      if (availability.errorMessage) {
        setError(availability.errorMessage);
      }
    });

    return () => {
      sttService.abortListening();
      sttService.clearCallbacks();
    };
  }, [addHistory]);

  const toggleListening = useCallback(async () => {
    if (isListening) {
      sttService.stopListening();
      return;
    }

    if (!isAvailable) {
      const availability = await sttService.checkAvailability();
      setStatus(availability.status);
      if (availability.errorMessage) {
        setError(availability.errorMessage);
      }
      if (availability.status !== 'available') return;
    }

    setError(null);
    setPhrase('');
    await sttService.startListening();
  }, [isAvailable, isListening]);

  return {
    isListening,
    isAvailable,
    isChecking,
    phrase,
    accuracy,
    error,
    toggleListening,
  };
}
