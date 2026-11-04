import { useDaySamples } from '@/features/shared/useDaySamples';
import { useSelectedDay } from '@/features/shared/useSelectedDay';

import { buildStrainView } from './strainView';

export function useStrainViewModel() {
  const { summary, history, dayLabel, isToday } = useSelectedDay();
  const samples = useDaySamples(summary?.dayKey ?? null);
  return { dayLabel, isLoadingSamples: samples.isLoading, ...buildStrainView(summary, history, samples.heartRates, isToday) };
}
