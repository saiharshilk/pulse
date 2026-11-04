import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { ScoreDial } from '@/components/ScoreDial';
import { ScreenBackground } from '@/components/ScreenBackground';
import { TopBar } from '@/components/TopBar';
import { APP_NAME } from '@/config/appConfig';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { ActivitiesCard } from './ActivitiesCard';
import { HeartRateCard } from './HeartRateCard';
import { HomeSummaryCards } from './HomeSummaryCards';
import { useHomeViewModel } from './useHomeViewModel';

export function HomeScreen() {
  const view = useHomeViewModel();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const dialSize = (width - 2 * layout.screenPadding - 2 * layout.dialGap) / 3;

  // Fade the day's content back in whenever the selected day changes.
  const fade = useSharedValue(1);
  useEffect(() => {
    fade.set(0);
    fade.set(withTiming(1, { duration: layout.dayFadeMs }));
  }, [fade, view.dayKey]);
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.get() }));

  return (
    <ScreenBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: layout.tabBarClearance + insets.bottom }]}
        refreshControl={
          <RefreshControl refreshing={view.isRefreshing} onRefresh={view.refresh} tintColor={colors.textPrimary} />
        }>
        <TopBar
          dateLabel={view.dateLabel}
          onPrev={view.goPrevDay}
          onNext={view.goNextDay}
          canPrev={view.canPrev}
          canNext={view.canNext}
          batteryLabel={view.batteryLabel}
          isRingConnected={view.isRingConnected}
        />
        <Text style={[typography.wordmark, styles.wordmark]}>{APP_NAME}</Text>
        {view.refreshErrorText !== null && <Text style={[typography.caption, styles.error]}>{view.refreshErrorText}</Text>}

        {!view.hasData && (
          <View style={styles.sections}>
            <EmptyState
              icon="sync-outline"
              title="No data yet"
              message="Sync with your ring to see your sleep, recovery and strain."
              actionTitle={view.isRefreshing ? 'Syncing…' : 'Sync now'}
              onAction={view.refresh}
            />
          </View>
        )}

        {view.hasData && (
          <Animated.View style={[styles.sections, fadeStyle]}>
            <View style={styles.dials}>
              <ScoreDial {...view.sleepDial} size={dialSize} onPress={() => router.push('/sleep')} />
              <ScoreDial {...view.recoveryDial} size={dialSize} onPress={() => router.push('/recovery')} />
              <ScoreDial {...view.strainDial} size={dialSize} onPress={() => router.push('/strain')} />
            </View>

            <HomeSummaryCards
              healthStatus={view.healthStatus}
              stepsValue={view.stepsValue}
              stepsProgress={view.stepsProgress}
              stepsCaption={view.stepsCaption}
            />

            <Text style={typography.screenTitle}>My Day</Text>

            <ActivitiesCard
              activitiesTitle={view.activitiesTitle}
              sleepRow={view.sleepRow}
              activityRows={view.activityRows}
              activitiesEmptyText={view.activitiesEmptyText}
            />

            <HeartRateCard
              value={view.heartRateValue}
              caption={view.heartRateCaption}
              sparklineValues={view.sparklineValues}
            />
          </Animated.View>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.sm },
  wordmark: { textAlign: 'center', marginTop: spacing.lg },
  error: { textAlign: 'center', color: colors.warn, marginTop: spacing.sm },
  sections: { gap: spacing.xxl, marginTop: spacing.xxl },
  dials: { flexDirection: 'row', justifyContent: 'space-between' },
});
