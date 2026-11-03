import type { InfoSection } from '@/components/InfoSheet';

export const STRAIN_INFO: InfoSection[] = [
  {
    title: 'How PULSE estimates strain',
    body:
      "From the moment you wake up until you fall asleep, PULSE turns your ring's heart rate into a minute-by-minute line. Every minute above your resting level adds load: everyday movement adds a little, and each higher heart-rate zone adds more. Total load becomes a score from 0 to 21 that gets harder to raise the higher it is.",
  },
  {
    title: 'Strain levels',
    body: 'Light 0–9.9, Moderate 10–13.9, Strenuous 14–17.9, All Out 18–21. Today\'s score keeps rising until you go to sleep.',
  },
  {
    title: 'Optimal strain',
    body:
      'A suggested range based on your recovery: 14–18 when you\'re green, 10–14 when yellow, and 0–10 when red. While recovery is calibrating, PULSE suggests 10–14.',
  },
  {
    title: 'Heart-rate zones',
    body:
      'Zones use your heart-rate reserve: the gap between your resting heart rate and your maximum (208 − 0.7 × age, unless you set your own). Zone 1 starts at 50% of that reserve.',
  },
  {
    title: 'Activities',
    body: 'PULSE marks an activity when your heart rate stays at 50% of your reserve or higher for at least 10 minutes.',
  },
  {
    title: 'Calories',
    body: 'Your estimated resting burn for the day so far plus the calories your ring counts from steps.',
  },
];
