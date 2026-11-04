import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { ToastHost } from '@/components/ToastHost';
import { InitErrorView, InitLoadingView } from '@/features/appInit/InitStatusViews';
import { SplashIntro } from '@/features/appInit/SplashIntro';
import { useAppStore } from '@/store/appStore';
import { colors } from '@/theme/colors';

// Keep the native splash up until the app is ready.
SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const initStatus = useAppStore((state) => state.initStatus);
  const initError = useAppStore((state) => state.initError);
  const onboardingComplete = useAppStore((state) => state.onboardingComplete);
  const init = useAppStore((state) => state.init);
  const syncIfStale = useAppStore((state) => state.syncIfStale);
  const [showIntro, setShowIntro] = useState(true);
  const hideIntro = useCallback(() => setShowIntro(false), []);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (initStatus !== 'loading') SplashScreen.hideAsync().catch(() => undefined);
  }, [initStatus]);

  // Coming back to the app syncs quietly if the last sync is more than 15 minutes old.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncIfStale();
    });
    return () => subscription.remove();
  }, [syncIfStale]);

  return (
    <>
      <StatusBar style="light" />
      {initStatus === 'loading' && <InitLoadingView />}
      {initStatus === 'error' && <InitErrorView message={initError ?? ''} onRetry={init} />}
      {initStatus === 'ready' && (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgBottom } }}>
          {/* Until setup is finished, only onboarding is reachable; afterwards, only the app. */}
          <Stack.Protected guard={onboardingComplete}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="sleep" />
            <Stack.Screen name="recovery" />
            <Stack.Screen name="strain" />
            <Stack.Screen name="health-monitor" />
            <Stack.Screen name="live" options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="trend/[metric]" />
          </Stack.Protected>
          <Stack.Protected guard={!onboardingComplete}>
            <Stack.Screen name="onboarding" />
          </Stack.Protected>
        </Stack>
      )}
      {initStatus === 'ready' && showIntro && <SplashIntro onDone={hideIntro} />}
      <ToastHost />
    </>
  );
}
