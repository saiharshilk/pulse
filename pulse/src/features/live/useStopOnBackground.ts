import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

// Calls `onBackground` whenever the app leaves the foreground, so live streams never keep running.
export function useStopOnBackground(onBackground: () => void): void {
  const latest = useRef(onBackground);
  useEffect(() => {
    latest.current = onBackground;
  });

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') latest.current();
    });
    return () => subscription.remove();
  }, []);
}
