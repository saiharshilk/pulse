// The only way screens and the store talk to the ring outside of history sync.
import type {
  ConnectionState,
  DeviceInfo,
  DiscoveredRing,
  RealtimeKind,
  RealtimeReading,
} from '@/types/provider';

import { getMeta, setMeta } from './db/metaRepository';
import { getProvider } from './providers';
import { RingError } from './providers/RingDataProvider';

const PAIRED_RING_KEY = 'pairedRing';

export function getConnectionState(): ConnectionState {
  return getProvider().getConnectionState();
}

export function onConnectionStateChange(listener: (state: ConnectionState) => void): () => void {
  return getProvider().onConnectionStateChange(listener);
}

// Reconnects to the remembered ring, or scans for one the first time.
export async function connectToRing(): Promise<void> {
  const provider = getProvider();
  if (provider.getConnectionState().status === 'connected') return;

  const remembered = await getMeta(PAIRED_RING_KEY);
  let ring: DiscoveredRing | undefined;
  if (remembered !== null) {
    ring = JSON.parse(remembered) as DiscoveredRing;
  } else {
    [ring] = await provider.scan();
  }
  if (ring === undefined) throw new RingError('noRingFound');

  await provider.connect(ring);
  await setMeta(PAIRED_RING_KEY, JSON.stringify(ring));
}

export function getDeviceInfo(): Promise<DeviceInfo> {
  return getProvider().getDeviceInfo();
}

export function startRealtime(
  kind: RealtimeKind,
  onReading: (reading: RealtimeReading) => void,
  onError: (error: Error) => void,
): () => void {
  return getProvider().startRealtime(kind, onReading, onError);
}

export function setRingTime(ts: number): Promise<void> {
  return getProvider().setTime(ts);
}

export function setHeartRateLog(enabled: boolean, intervalMinutes: number): Promise<void> {
  return getProvider().setHeartRateLog(enabled, intervalMinutes);
}
