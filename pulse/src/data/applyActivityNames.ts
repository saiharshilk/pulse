// Pure: puts the names people chose onto detected activities. Kept apart from the scoring
// engine so scoring stays a pure function of the ring's readings.
import type { DailySummary } from '@/types/computed';

import type { ActivityNames } from './db/activityNamesRepository';

export function applyActivityNames(summaries: DailySummary[], names: ActivityNames): DailySummary[] {
  return summaries.map((summary) => {
    if (!summary.activities.some((activity) => names[activity.id] !== undefined)) return summary;
    return {
      ...summary,
      activities: summary.activities.map((activity) => {
        const name = names[activity.id];
        return name === undefined ? activity : { ...activity, name };
      }),
    };
  });
}
