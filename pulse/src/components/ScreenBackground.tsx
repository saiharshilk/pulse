import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';

type ScreenBackgroundProps = { children: ReactNode };

export function ScreenBackground({ children }: ScreenBackgroundProps) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient colors={[colors.bgTop, colors.bgBottom]} style={styles.fill}>
      <View style={[styles.fill, { paddingTop: insets.top }]}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
