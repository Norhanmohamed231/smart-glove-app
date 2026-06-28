import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GlovePipelineProvider } from '@/src/providers/GlovePipelineProvider';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <GlovePipelineProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </GlovePipelineProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
