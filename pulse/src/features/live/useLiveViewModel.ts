import { useAppStore } from '@/store/appStore';
import { maxHeartRate } from '@/scoring/heartRateSeries';
import { STRAIN } from '@/scoring/scoringConstants';
import { NO_VALUE } from '@/utils/format';

import { averageOfStats, LIVE, liveZoneLabel } from './liveMath';
import { useLiveHeartRate } from './useLiveHeartRate';
import { useSpO2SpotCheck } from './useSpO2SpotCheck';

export type LiveMode = 'heartRate' | 'spo2';

function statText(value: number | null): string {
  return value === null || !Number.isFinite(value) ? NO_VALUE : String(Math.round(value));
}

// Turns the two live hooks into display-ready strings. Only the visible mode streams.
export function useLiveViewModel(mode: LiveMode) {
  const profile = useAppStore((state) => state.profile);
  const summaries = useAppStore((state) => state.summaries);
  const deviceInfo = useAppStore((state) => state.deviceInfo);
  const connection = useAppStore((state) => state.connection);
  const heartRate = useLiveHeartRate(mode === 'heartRate');
  const spo2 = useSpO2SpotCheck(mode === 'spo2');

  // The latest night's resting heart rate sets the zones, like strain does.
  const lastNight = [...summaries].reverse().find((day) => day.sleep !== null)?.sleep ?? null;
  const restingHR = lastNight?.restingHR ?? STRAIN.defaultRestingHR;
  const latest = heartRate.latest;
  const { phase } = spo2;
  const elapsedMs = phase.kind === 'measuring' ? phase.elapsedMs : 0;

  return {
    batteryLabel: deviceInfo === null ? NO_VALUE : `${deviceInfo.batteryPercent}%`,
    isRingConnected: connection.status === 'connected',
    heartRate: {
      bpm: latest?.bpm ?? null,
      bpmText: latest === null ? NO_VALUE : String(latest.bpm),
      zoneLabel: latest === null ? 'Waiting for a reading…' : liveZoneLabel(latest.bpm, restingHR, maxHeartRate(profile)),
      chartData: heartRate.readings.map((reading) => ({ x: reading.ts, y: reading.bpm })),
      chartDomain:
        latest === null ? undefined : { start: latest.ts - LIVE.chartWindowMs, end: latest.ts },
      min: statText(heartRate.stats.min),
      avg: statText(averageOfStats(heartRate.stats)),
      max: statText(heartRate.stats.max),
      isRunning: heartRate.isRunning,
      error: heartRate.error,
      start: heartRate.start,
      stop: heartRate.stop,
    },
    spo2: {
      phase,
      progress: Math.min(1, elapsedMs / LIVE.spo2MeasureMs),
      countdownText:
        elapsedMs < LIVE.spo2MeasureMs ? `${Math.ceil((LIVE.spo2MeasureMs - elapsedMs) / 1000)} s` : 'Still measuring…',
      resultText: phase.kind === 'result' ? `${phase.percent}%` : NO_VALUE,
      saveText:
        phase.kind !== 'result'
          ? ''
          : phase.saveState === 'saved'
            ? 'Saved'
            : phase.saveState === 'saving'
              ? 'Saving…'
              : "Couldn't save this reading.",
      start: spo2.start,
    },
  };
}
