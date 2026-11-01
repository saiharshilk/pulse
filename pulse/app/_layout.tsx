import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { InitErrorView, InitLoadingView } from '@/features/appInit/InitStatusViews';
import { useAppStore } from '@/store/appStore';
import { colors } from '@/theme/colors';

// Keep the native splash up until the first sync finishes.
SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const initStatus = useAppStore((state) => state.initStatus);
  const initError = useAppStore((state) => state.initError);
  const init = useAppStore((state) => state.init);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (initStatus !== 'loading') SplashScreen.hideAsync().catch(() => undefined);
  }, [initStatus]);

  return (
    <>
      <StatusBar style="light" />
      {initStatus === 'loading' && <InitLoadingView />}
      {initStatus === 'error' && <InitErrorView message={initError ?? ''} onRetry={init} />}
      {initStatus === 'ready' && (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgBottom } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="sleep" />
          <Stack.Screen name="recovery" />
          <Stack.Screen name="strain" />
          <Stack.Screen name="health-monitor" />
          <Stack.Screen name="live" options={{ presentation: 'modal' }} />
        </Stack>
      )}
    </>
  );
}
