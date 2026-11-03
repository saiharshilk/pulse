import { useCallback, useEffect, useRef, useState } from 'react';

import { pairRing, scanForRings } from '@/data/deviceManager';
import type { DiscoveredRing } from '@/types/provider';
import { lightHaptic, successHaptic, warningHaptic } from '@/utils/haptics';

export type PairingState =
  | { kind: 'searching' }
  | { kind: 'found'; rings: DiscoveredRing[] }
  | { kind: 'connecting'; ring: DiscoveredRing }
  | { kind: 'connected'; ring: DiscoveredRing }
  | { kind: 'failed'; message: string };

// Searches as soon as the screen opens, then pairs the ring the user taps.
export function usePairing() {
  const [state, setState] = useState<PairingState>({ kind: 'searching' });
  const isMounted = useRef(true);

  const search = useCallback(() => {
    setState({ kind: 'searching' });
    scanForRings()
      .then((rings) => {
        if (!isMounted.current) return;
        if (rings.length === 0) {
          warningHaptic();
          setState({ kind: 'failed', message: "Couldn't find your ring" });
        } else {
          setState({ kind: 'found', rings });
        }
      })
      .catch(() => {
        if (!isMounted.current) return;
        warningHaptic();
        setState({ kind: 'failed', message: "Couldn't find your ring" });
      });
  }, []);

  const connect = useCallback((ring: DiscoveredRing) => {
    lightHaptic();
    setState({ kind: 'connecting', ring });
    pairRing(ring)
      .then(() => {
        if (!isMounted.current) return;
        successHaptic();
        setState({ kind: 'connected', ring });
      })
      .catch(() => {
        if (!isMounted.current) return;
        warningHaptic();
        setState({ kind: 'failed', message: `Couldn't connect to ${ring.name}` });
      });
  }, []);

  useEffect(() => {
    isMounted.current = true;
    search();
    return () => {
      isMounted.current = false;
    };
  }, [search]);

  return { state, search, connect };
}
