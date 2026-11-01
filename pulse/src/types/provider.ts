// What ring data providers return: raw, ring-shaped data only.
import type { StepSample } from './raw';

export type HeartRateReading = { ts: number; bpm: number }; // bpm may be 0 = missing
export type StepReading = StepSample;
export type RingSyncBatch = { heartRates: HeartRateReading[]; steps: StepReading[] };
export type DeviceInfo = { name: string; id: string; batteryPercent: number; firmware?: string };
export type DiscoveredRing = { id: string; name: string };
export type ConnectionState =
  | { status: 'disconnected' }
  | { status: 'scanning' }
  | { status: 'connecting' }
  | { status: 'connected' }
  | { status: 'failed'; message: string };
export type RealtimeKind = 'heartRate' | 'spo2';
export type RealtimeReading = { ts: number; value: number; kind: RealtimeKind };
