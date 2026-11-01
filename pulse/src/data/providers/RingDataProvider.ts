import type {
  ConnectionState,
  DeviceInfo,
  DiscoveredRing,
  RealtimeKind,
  RealtimeReading,
  RingSyncBatch,
} from '@/types/provider';

// Swapping the mock ring for the real one only means swapping this interface's implementation.
export interface RingDataProvider {
  getConnectionState(): ConnectionState;
  onConnectionStateChange(listener: (s: ConnectionState) => void): () => void; // returns unsubscribe
  scan(): Promise<DiscoveredRing[]>;
  connect(ring: DiscoveredRing): Promise<void>;
  disconnect(): Promise<void>;
  getDeviceInfo(): Promise<DeviceInfo>;
  syncHistory(sinceTs: number): Promise<RingSyncBatch>;
  startRealtime(
    kind: RealtimeKind,
    onReading: (r: RealtimeReading) => void,
    onError: (e: Error) => void,
  ): () => void; // returns stop
  setTime(ts: number): Promise<void>;
  setHeartRateLog(enabled: boolean, intervalMinutes: number): Promise<void>;
}

export type RingErrorCode = 'notImplemented' | 'noRingFound';

export class RingError extends Error {
  code: RingErrorCode;

  constructor(code: RingErrorCode) {
    super(`Ring error: ${code}`);
    this.name = 'RingError';
    this.code = code;
  }
}
