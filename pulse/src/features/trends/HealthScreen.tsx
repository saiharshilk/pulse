import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FadeInSection } from '@/components/FadeInSection';
import { ScreenBackground } from '@/components/ScreenBackground';
import { SegmentedControl } from '@/components/SegmentedControl';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { TrendCard } from './TrendCard';
import type { TrendRange } from './trendMath';
import { useTrendsViewModel } from './useTrendsViewModel';

export const RANGE_OPTIONS: { key: `${TrendRange}`; label: string }[] = [
  { key: '7', label: '7D' },
  { key: '30', label: '30D' },
  { key: '90', label: '90D' },
];

export function HealthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [range, setRange] = useState<TrendRange>(30);
  const { cards } = useTrendsViewModel(range);

  return (
    <ScreenBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: layout.tabBarClearance + insets.bottom }]}>
        <Text style={typography.screenTitle}>Health</Text>
        <SegmentedControl options={RANGE_OPTIONS} value={`${range}`} onChange={(key) => setRange(Number(key) as TrendRange)} />
        {cards.map((card, i) => (
          <FadeInSection key={card.key} index={i}>
            <TrendCard
              card={card}
              onPress={() => router.push({ pathname: '/trend/[metric]', params: { metric: card.key, range: String(range) } })}
            />
          </FadeInSection>
        ))}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.lg, gap: spacing.lg },
});
