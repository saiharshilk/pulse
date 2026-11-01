import { DATA_SOURCE } from '@/config/appConfig';

import { ColmiRingProvider } from './ColmiRingProvider';
import { MockRingProvider } from './MockRingProvider';
import type { RingDataProvider } from './RingDataProvider';

let provider: RingDataProvider | null = null;

// One shared provider for the whole app, chosen by the data source setting.
export function getProvider(): RingDataProvider {
  if (provider === null) {
    provider = DATA_SOURCE === 'mock' ? new MockRingProvider() : new ColmiRingProvider();
  }
  return provider;
}
