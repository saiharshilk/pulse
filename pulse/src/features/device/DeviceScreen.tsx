import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FadeInSection } from '@/components/FadeInSection';
import { ScreenBackground } from '@/components/ScreenBackground';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { DeveloperCard } from './DeveloperCard';
import { ProfileCard } from './ProfileCard';
import { RingCard } from './RingCard';
import { DataSourceCard, HeartRateLogCard, UnitsCard } from './SettingsCards';
import { useDeviceViewModel } from './useDeviceViewModel';

export function DeviceScreen() {
  const view = useDeviceViewModel();
  const insets = useSafeAreaInsets();
  return (
    <ScreenBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: layout.tabBarClearance + insets.bottom }]}>
        <Text style={typography.screenTitle}>Device</Text>
        <FadeInSection index={0}>
          <RingCard view={view} />
        </FadeInSection>
        <FadeInSection index={1}>
          <HeartRateLogCard />
        </FadeInSection>
        <FadeInSection index={2}>
          <ProfileCard />
        </FadeInSection>
        <FadeInSection index={3}>
          <UnitsCard />
        </FadeInSection>
        <FadeInSection index={4}>
          <DataSourceCard />
        </FadeInSection>
        <FadeInSection index={5}>
          <DeveloperCard versionText={view.versionText} buildText={view.buildText} />
        </FadeInSection>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.lg, gap: spacing.lg },
});
