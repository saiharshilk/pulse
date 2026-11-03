import { useSelectedDay } from '@/features/shared/useSelectedDay';

import { buildRecoveryView } from './recoveryView';

export function useRecoveryViewModel() {
  const { summary, history, dayLabel } = useSelectedDay();
  return { dayLabel, ...buildRecoveryView(summary, history) };
}
