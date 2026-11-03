import type { InfoSection } from '@/components/InfoSheet';

export const SLEEP_INFO: InfoSection[] = [
  {
    title: 'How PULSE estimates sleep',
    body:
      "Your ring logs your heart rate every 5 minutes and your steps every 15 minutes. PULSE looks for the longest stretch where you took no steps and your heart rate sat near its overnight low. That stretch is your sleep. It's an estimate: the ring can tell asleep from awake, but not sleep stages.",
  },
  {
    title: 'Sleep performance',
    body: 'Hours asleep compared with the sleep your body needed last night, as a percentage. 85% or more is optimal.',
  },
  {
    title: 'Hours vs. needed',
    body: 'The same comparison as sleep performance, shown on the Poor / Sufficient / Optimal scale.',
  },
  {
    title: 'Sleep consistency',
    body:
      'How closely your bedtime and wake time match your previous 4 nights. A steady schedule scores higher. It appears once PULSE has 4 earlier nights to compare.',
  },
  {
    title: 'Sleep efficiency',
    body: 'The share of your time in bed that you spent asleep. Times you woke up (a few steps and a higher heart rate) count against it.',
  },
  {
    title: 'Sleep need',
    body:
      'Your baseline need (8 hours unless you change it), plus extra after a high-strain day, plus a little to pay back recent short nights.',
  },
  {
    title: 'Sleeping heart rate',
    body:
      'Resting heart rate is your lowest 30-minute average while asleep. Average sleeping heart rate is the mean across the whole night. Lower than usual is generally a good sign.',
  },
];
