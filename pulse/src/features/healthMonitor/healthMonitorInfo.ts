import type { InfoSection } from '@/components/InfoSheet';

export const HEALTH_MONITOR_INFO: InfoSection[] = [
  {
    title: 'What Health Monitor checks',
    body:
      "Each morning PULSE compares last night's resting heart rate and average sleeping heart rate with your own normal range. Both come from the heart rate your ring logs every 5 minutes while you sleep.",
  },
  {
    title: 'Your normal range',
    body:
      'Your average over the previous 30 nights, plus or minus one and a half times how much it usually varies. Ranges appear after 4 nights of sleep.',
  },
  {
    title: 'Out of range',
    body:
      'A value outside your range can follow a hard workout, alcohol, a late meal, stress or the start of an illness. One night on its own usually isn’t a concern; a pattern over several nights is worth noticing.',
  },
  {
    title: 'Blood oxygen (spot check)',
    body:
      "The ring can't log blood oxygen overnight, so PULSE shows the readings you take yourself from the Live screen. They aren't counted in the status above. PULSE is not a medical device.",
  },
];
