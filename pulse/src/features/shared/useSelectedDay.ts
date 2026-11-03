import { useState } from 'react';

import { useAppStore } from '@/store/appStore';
import type { DailySummary } from '@/types/computed';
import { formatDayLabel } from '@/utils/format';
import { dayKeyOf } from '@/utils/time';

export type SelectedDay = {
  summary: DailySummary | null;
  history: DailySummary[]; // every day up to and including the selected one, oldest first
  dayLabel: string; // "TODAY", "YESTERDAY" or "MON, OCT 26"
  isToday: boolean;
  now: number;
};

// The day picked on Home, shared by every detail screen.
export function useSelectedDay(): SelectedDay {
  const summaries = useAppStore((state) => state.summaries);
  const selectedDayKey = useAppStore((state) => state.selectedDayKey);
  const [now] = useState(() => Date.now());

  const index = summaries.findIndex((summary) => summary.dayKey === selectedDayKey);
  const summary = summaries[index] ?? null;
  return {
    summary,
    history: index < 0 ? [] : summaries.slice(0, index + 1),
    dayLabel: summary === null ? 'TODAY' : formatDayLabel(summary.dayStart, now),
    isToday: summary !== null && summary.dayKey === dayKeyOf(now),
    now,
  };
}
