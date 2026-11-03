import { useDaySamples } from '@/features/shared/useDaySamples';
import { useSelectedDay } from '@/features/shared/useSelectedDay';

import { buildSleepView } from './sleepView';

export function useSleepViewModel() {
  const { summary, history, dayLabel } = useSelectedDay();
  const samples = useDaySamples(summary?.dayKey ?? null);
  return { dayLabel, ...buildSleepView(summary, history, samples.heartRates) };
}
