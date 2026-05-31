import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GlovePipelineProvider } from '@/src/providers/GlovePipelineProvider';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GlovePipelineProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </GlovePipelineProvider>
    </SafeAreaProvider>
  );
}
