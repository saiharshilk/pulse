// Implemented in Prompt 5 by porting github.com/tahnok/colmi_r02_client.
import type {
  ConnectionState,
  DeviceInfo,
  DiscoveredRing,
  RingSyncBatch,
} from '@/types/provider';

import { RingError, type RingDataProvider } from './RingDataProvider';

export class ColmiRingProvider implements RingDataProvider {
  getConnectionState(): ConnectionState {
    throw new RingError('notImplemented');
  }

  onConnectionStateChange(): () => void {
    throw new RingError('notImplemented');
  }

  scan(): Promise<DiscoveredRing[]> {
    throw new RingError('notImplemented');
  }

  connect(): Promise<void> {
    throw new RingError('notImplemented');
  }

  disconnect(): Promise<void> {
    throw new RingError('notImplemented');
  }

  getDeviceInfo(): Promise<DeviceInfo> {
    throw new RingError('notImplemented');
  }

  syncHistory(): Promise<RingSyncBatch> {
    throw new RingError('notImplemented');
  }

  startRealtime(): () => void {
    throw new RingError('notImplemented');
  }

  setTime(): Promise<void> {
    throw new RingError('notImplemented');
  }

  setHeartRateLog(): Promise<void> {
    throw new RingError('notImplemented');
  }
}
