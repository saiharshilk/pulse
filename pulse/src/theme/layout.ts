import { spacing } from './spacing';

const TAB_BAR_HEIGHT = 64;
const TAB_BAR_FLOAT = 16;

export const layout = {
  screenPadding: spacing.xl,
  cardRadius: 20,
  cardPadding: spacing.xl,
  pressedOpacity: 0.7,

  // Score dials
  dialGap: spacing.lg,
  dialStrokeRatio: 0.09,
  // Text scales with the dial, so "12.4" fits inside the small Home dials.
  dialValueSizeRatio: 0.36,
  dialSuffixSizeRatio: 0.2,
  dialAnimationMs: 800,
  dayFadeMs: 220,

  // Floating tab bar
  tabBarHeight: TAB_BAR_HEIGHT,
  tabBarFloat: TAB_BAR_FLOAT,
  tabBarSideMargin: spacing.lg,
  tabBarBlurIntensity: 40,
  liveButtonPulseMs: 900,
  liveButtonPulseScale: 1.12,
  // Scroll content needs this much room (plus the bottom safe area) to clear the bar.
  tabBarClearance: TAB_BAR_HEIGHT + TAB_BAR_FLOAT + spacing.xxl,

  // Small shared sizes
  iconCircle: 36,
  profileCircle: 36,
  rangeBarHeight: 4,
  rangeMarkerWidth: 3,
  rangeMarkerHeight: 10,
  progressBarHeight: 4,
  strainBadgeSize: 34,

  // Heart rate card
  sparklineHeight: 72,
  sparklineMaxPoints: 96,
} as const;
