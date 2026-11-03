import { StyleSheet } from 'react-native';

import { colors } from './colors';

// iOS system font (SF Pro) everywhere, so no fontFamily is set.
export const typography = StyleSheet.create({
  labelCaps: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textPrimary,
  },
  dialValue: {
    fontSize: 44,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    color: colors.textPrimary,
  },
  dialSuffix: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bigDialValue: {
    fontSize: 64,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    color: colors.textPrimary,
  },
  bigDialSuffix: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  body: {
    fontSize: 17,
    fontWeight: '400',
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    color: colors.textPrimary,
  },
  wordmark: {
    fontSize: 22,
    fontWeight: '300',
    letterSpacing: 6,
    color: colors.textPrimary,
  },
});
