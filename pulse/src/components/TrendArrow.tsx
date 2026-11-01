import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/theme/colors';
import type { Trend } from '@/types/computed';

type TrendArrowProps = { trend: Trend; higherIsBetter: boolean };

export function TrendArrow({ trend, higherIsBetter }: TrendArrowProps) {
  if (trend === 'flat') return null;
  const isGood = (trend === 'up') === higherIsBetter;
  return (
    <Ionicons
      name={trend === 'up' ? 'caret-up' : 'caret-down'}
      size={12}
      color={isGood ? colors.good : colors.warn}
    />
  );
}
