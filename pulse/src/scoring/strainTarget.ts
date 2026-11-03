import { OPTIMAL_STRAIN, RECOVERY_BANDS } from './scoringConstants';

export type StrainTarget = { low: number; high: number };

// How much strain suits today, based on recovery. Null means recovery is still calibrating.
export function optimalStrainTarget(recoveryScore: number | null): StrainTarget {
  if (recoveryScore === null) return OPTIMAL_STRAIN.calibrating;
  if (recoveryScore >= RECOVERY_BANDS.green) return OPTIMAL_STRAIN.green;
  if (recoveryScore >= RECOVERY_BANDS.yellow) return OPTIMAL_STRAIN.yellow;
  return OPTIMAL_STRAIN.red;
}
