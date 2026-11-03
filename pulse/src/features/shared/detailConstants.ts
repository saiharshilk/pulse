// Tunable numbers shared by the detail screens.
export const DETAIL = {
  historyDays: 7, // the "LAST 7" charts
  trendDays: 30, // the 30-day line chart and comparisons
  performanceFlatPoints: 5, // sleep performance within this many points of usual counts as flat
  calibratingBarFraction: 0.08, // a calibrating day's short gray bar, as a fraction of the chart
  calibrationNights: 4,
  bigDialMaxSize: 240,
} as const;
