import type { InfoSection } from '@/components/InfoSheet';

export const RECOVERY_INFO: InfoSection[] = [
  {
    title: 'How PULSE estimates recovery',
    body:
      "Each morning PULSE compares last night's heart rate with your own baseline from the previous 30 days, then adds how much of your sleep need you got. A lower overnight heart rate than usual plus enough sleep means a higher score. HRV isn't available from this ring, so PULSE relies on heart rate alone.",
  },
  {
    title: 'Recovery score',
    body: '67–99% is green (ready to push), 34–66% is yellow (take it steady), 1–33% is red (your body could use rest).',
  },
  {
    title: 'Calibrating',
    body: 'PULSE needs 4 nights of sleep before it knows your baseline well enough to score recovery.',
  },
  {
    title: 'Resting heart rate',
    body: 'Your lowest 30-minute average heart rate while asleep. Lower than your baseline is usually a sign of good recovery.',
  },
  {
    title: 'Sleeping heart rate',
    body: 'Your average heart rate across the whole night. Like resting heart rate, lower than usual is generally better.',
  },
  {
    title: 'Sleep performance',
    body: 'Hours asleep compared with the sleep you needed. It accounts for about a third of the recovery score.',
  },
  {
    title: 'Arrows',
    body: 'Each arrow compares today with your prior 30 days. Green means the change is good for recovery; orange means it isn\'t.',
  },
];
