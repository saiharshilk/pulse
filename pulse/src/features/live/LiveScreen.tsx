import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableOpacity } from '@/components/PressableOpacity';
import { RingStatus } from '@/components/RingStatus';
import { ScreenBackground } from '@/components/ScreenBackground';
import { SegmentedControl } from '@/components/SegmentedControl';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

import { HeartRateMode } from './HeartRateMode';
import { SpO2Mode } from './SpO2Mode';
import { useLiveViewModel, type LiveMode } from './useLiveViewModel';

const MODES: { key: LiveMode; label: string }[] = [
  { key: 'heartRate', label: 'Heart rate' },
  { key: 'spo2', label: 'SpO2' },
];

export function LiveScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<LiveMode>(params.mode === 'spo2' ? 'spo2' : 'heartRate');
  const view = useLiveViewModel(mode);

  return (
    <ScreenBackground>
      <View style={styles.header}>
        <PressableOpacity onPress={() => router.back()} style={styles.close} accessibilityLabel="Close">
          <Ionicons name="close" size={26} color={colors.textPrimary} />
        </PressableOpacity>
        <RingStatus batteryLabel={view.batteryLabel} isConnected={view.isRingConnected} />
      </View>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}
        showsVerticalScrollIndicator={false}>
        <SegmentedControl options={MODES} value={mode} onChange={setMode} />
        {mode === 'heartRate' ? <HeartRateMode view={view.heartRate} /> : <SpO2Mode view={view.spo2} />}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    height: 44,
  },
  close: { width: 44, height: 44, justifyContent: 'center' },
  content: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.lg, gap: spacing.xxl },
});
