import { DATA_SOURCE, MOCK_SEED, type DataSource } from '@/config/appConfig';

import { ColmiRingProvider } from './ColmiRingProvider';
import { MockRingProvider } from './MockRingProvider';
import type { RingDataProvider } from './RingDataProvider';

export type ProviderConfig = { dataSource: DataSource; mockSeed: number };

let config: ProviderConfig = { dataSource: DATA_SOURCE, mockSeed: MOCK_SEED };
let provider: RingDataProvider | null = null;

// Called with the saved settings at startup, and again whenever they change.
// A different data source or mock seed means a fresh provider.
export function configureProvider(next: ProviderConfig): void {
  if (next.dataSource === config.dataSource && next.mockSeed === config.mockSeed) return;
  config = next;
  provider = null;
}

// One shared provider for the whole app, chosen by the data source setting.
export function getProvider(): RingDataProvider {
  if (provider === null) {
    provider = config.dataSource === 'mock' ? new MockRingProvider(config.mockSeed) : new ColmiRingProvider();
  }
  return provider;
}
