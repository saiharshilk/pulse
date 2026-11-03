import { MOCK_RING } from '@/data/mock/mockConstants';
import { generateMockHistory } from '@/data/mock/mockDataGenerator';
import { createSeededRandom } from '@/data/mock/seededRandom';
import type {
  ConnectionState,
  DeviceInfo,
  DiscoveredRing,
  RealtimeKind,
  RealtimeReading,
  RingSyncBatch,
} from '@/types/provider';
import { MS_PER_DAY, MS_PER_HOUR } from '@/utils/time';

import type { RingDataProvider } from './RingDataProvider';

const STEP_BUCKET_MS = 15 * 60_000;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockRingProvider implements RingDataProvider {
  private state: ConnectionState = { status: 'disconnected' };
  private listeners = new Set<(s: ConnectionState) => void>();
  private startedAt = Date.now();
  private seed: number;
  private realtimeRandom: ReturnType<typeof createSeededRandom>;

  constructor(seed: number) {
    this.seed = seed;
    this.realtimeRandom = createSeededRandom(seed);
  }

  // Stored only so later prompts can read back what was set.
  ringTime: number | null = null;
  heartRateLog = { enabled: true, intervalMinutes: 5 };

  getConnectionState(): ConnectionState {
    return this.state;
  }

  onConnectionStateChange(listener: (s: ConnectionState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setState(next: ConnectionState): void {
    this.state = next;
    this.listeners.forEach((listener) => listener(next));
  }

  async scan(): Promise<DiscoveredRing[]> {
    this.setState({ status: 'scanning' });
    await wait(MOCK_RING.scanDelayMs);
    this.setState({ status: 'disconnected' });
    return [{ id: MOCK_RING.id, name: MOCK_RING.name }];
  }

  async connect(_ring: DiscoveredRing): Promise<void> {
    this.setState({ status: 'connecting' });
    await wait(MOCK_RING.connectDelayMs);
    this.setState({ status: 'connected' });
  }

  async disconnect(): Promise<void> {
    this.setState({ status: 'disconnected' });
  }

  async getDeviceInfo(): Promise<DeviceInfo> {
    const hoursRunning = (Date.now() - this.startedAt) / MS_PER_HOUR;
    return {
      name: MOCK_RING.name,
      id: MOCK_RING.id,
      batteryPercent: Math.max(0, Math.round(MOCK_RING.startBattery - hoursRunning)),
      firmware: MOCK_RING.firmware,
    };
  }

  async syncHistory(sinceTs: number): Promise<RingSyncBatch> {
    const now = Date.now();
    const days = Math.ceil((now - sinceTs) / MS_PER_DAY) + 1;
    const history = generateMockHistory({ seed: this.seed, now, days });
    return {
      heartRates: history.heartRates.filter((reading) => reading.ts >= sinceTs),
      // Keep any bucket that finished after the last sync, even if it started before it.
      steps: history.steps.filter((bucket) => bucket.start + STEP_BUCKET_MS > sinceTs),
    };
  }

  startRealtime(
    kind: RealtimeKind,
    onReading: (r: RealtimeReading) => void,
    _onError: (e: Error) => void,
  ): () => void {
    return kind === 'heartRate'
      ? this.startRealtimeHeartRate(onReading)
      : this.startRealtimeSpO2(onReading);
  }

  private startRealtimeHeartRate(onReading: (r: RealtimeReading) => void): () => void {
    const { center, spread, maxStep } = MOCK_RING.realtimeHeartRate;
    let bpm: number = center;
    const timer = setInterval(() => {
      // A random walk that stays within center ± spread.
      const step = this.realtimeRandom.range(-maxStep, maxStep);
      bpm = Math.min(center + spread, Math.max(center - spread, bpm + step));
      onReading({ ts: Date.now(), value: Math.round(bpm), kind: 'heartRate' });
    }, MOCK_RING.realtimeIntervalMs);
    return () => clearInterval(timer);
  }

  private startRealtimeSpO2(onReading: (r: RealtimeReading) => void): () => void {
    const { min, max, measuringMs } = MOCK_RING.realtimeSpO2;
    let timer: ReturnType<typeof setInterval> | null = null;
    // Nothing for a few seconds while the ring is "measuring".
    const delay = setTimeout(() => {
      timer = setInterval(() => {
        onReading({ ts: Date.now(), value: this.realtimeRandom.int(min, max), kind: 'spo2' });
      }, MOCK_RING.realtimeIntervalMs);
    }, measuringMs);
    return () => {
      clearTimeout(delay);
      if (timer !== null) clearInterval(timer);
    };
  }

  async setTime(ts: number): Promise<void> {
    await wait(MOCK_RING.commandDelayMs);
    this.ringTime = ts;
  }

  async setHeartRateLog(enabled: boolean, intervalMinutes: number): Promise<void> {
    await wait(MOCK_RING.commandDelayMs);
    this.heartRateLog = { enabled, intervalMinutes };
  }
}
