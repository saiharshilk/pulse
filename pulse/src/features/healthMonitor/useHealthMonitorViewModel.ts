import { useSelectedDay } from '@/features/shared/useSelectedDay';
import { useAppStore } from '@/store/appStore';

import { buildHealthMonitorView } from './healthMonitorView';

export function useHealthMonitorViewModel() {
  const { summary, history, dayLabel, now } = useSelectedDay();
  const spo2Checks = useAppStore((state) => state.spo2Checks);
  return { dayLabel, ...buildHealthMonitorView(summary, history, spo2Checks, now) };
}
