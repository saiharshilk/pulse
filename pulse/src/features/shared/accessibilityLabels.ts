// Pure: what VoiceOver says for the score dials, e.g. "Recovery 72 percent, green".
import { RECOVERY_BANDS, SLEEP_BANDS, STRAIN, STRAIN_BANDS } from '@/scoring/scoringConstants';
import { formatStrain } from '@/utils/format';

export function recoveryBandName(score: number): string {
  if (score >= RECOVERY_BANDS.green) return 'green';
  if (score >= RECOVERY_BANDS.yellow) return 'yellow';
  return 'red';
}

export function sleepBandName(performance: number): string {
  if (performance >= SLEEP_BANDS.optimal) return 'optimal';
  if (performance >= SLEEP_BANDS.sufficient) return 'sufficient';
  return 'poor';
}

export function strainLevelName(score: number): string {
  if (score >= STRAIN_BANDS.allOut) return 'all out';
  if (score >= STRAIN_BANDS.strenuous) return 'strenuous';
  if (score >= STRAIN_BANDS.moderate) return 'moderate';
  return 'light';
}

export function sleepDialLabel(performance: number | null): string {
  return performance === null ? 'Sleep, no sleep detected' : `Sleep ${performance} percent, ${sleepBandName(performance)}`;
}

export function recoveryDialLabel(score: number | null, isCalibrating: boolean): string {
  if (isCalibrating) return 'Recovery, calibrating';
  return score === null ? 'Recovery, no data' : `Recovery ${score} percent, ${recoveryBandName(score)}`;
}

export function strainDialLabel(score: number): string {
  return `Strain ${formatStrain(score)} of ${STRAIN.maxScore}, ${strainLevelName(score)}`;
}

// "Last 7 nights: W 7:59, T 3:19, F 8:07…" — every bar's label and value, for charts with few bars.
export function barsSummary(intro: string, bars: { label: string; valueLabel: string }[]): string {
  return `${intro}: ${bars.map((bar) => `${bar.label} ${bar.valueLabel}`.trim()).join(', ')}.`;
}

// "Resting heart rate over 30 days, between 43 and 53 bpm."
export function rangeSummary(intro: string, values: number[], unit: string): string {
  if (values.length === 0) return `${intro}: no data.`;
  return `${intro}, between ${Math.round(Math.min(...values))} and ${Math.round(Math.max(...values))} ${unit}.`;
}
