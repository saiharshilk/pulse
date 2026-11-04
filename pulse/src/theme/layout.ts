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

  // Detail screens and charts
  bigDialWidthRatio: 0.55,
  bigDialTopLabelRatio: 0.06,
  chartRevealMs: 600,
  sectionFadeMs: 400,
  sectionFadeStaggerMs: 60,
  lineChartHeight: 140,
  barChartHeight: 150,
  sleepTimelineHrHeight: 56,
  sleepTimelineBarHeight: 16,
  horizontalBarHeight: 8,
  gaugeHeight: 10,
  sheetRadius: 24,
  sheetMaxHeightRatio: 0.8,
  progressDotSize: 8,

  // Live screen
  liveHeartSize: 110,
  liveHeartPulseScale: 0.16, // how much the heart grows on each beat
  liveChartHeight: 120,
  measuringRingSize: 200,
  measuringRingStroke: 10,
  measuringSpinMs: 1400,

  // Health tab
  trendCardChartHeight: 110,
  trendDetailChartHeight: 200,

  // Feedback and loading
  toastMs: 2000,
  toastTopGap: 4, // space between the status bar and the toast
  toastIconSize: 16,
  toastPaddingVertical: 6,
  toastRadius: 18, // half the pill's one-line height, so the ends are round
  skeletonPulseMs: 800,

  // Splash intro and onboarding
  logoSize: 120,
  splashIntroMs: 600,
  splashFadeOutMs: 350,
  ringIllustrationWidth: 120,
  pairingPhoneWidth: 70,
  pairingNodeSize: 18,
  pairingCheckSize: 64,
} as const;
