import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { PillButton } from '@/components/PillButton';
import { PressableOpacity } from '@/components/PressableOpacity';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { OnboardingFrame } from './OnboardingFrame';
import { PairingGraphic } from './PairingGraphic';
import { usePairing } from './usePairing';

export function PairRingScreen() {
  const router = useRouter();
  const { state, search, connect } = usePairing();
  const goToSync = () => router.push('/onboarding/syncing');

  const footer =
    state.kind === 'connected' ? (
      <PillButton title="Continue" onPress={goToSync} />
    ) : state.kind === 'failed' ? (
      <>
        <PillButton title="Try again" onPress={search} />
        <PressableOpacity onPress={goToSync} accessibilityRole="button" style={styles.skip}>
          <Text style={[typography.labelCaps, styles.skipText]}>Skip for now</Text>
        </PressableOpacity>
      </>
    ) : undefined;

  return (
    <OnboardingFrame footer={footer}>
      <Text style={typography.screenTitle}>Pair your ring</Text>
      <View style={styles.graphic}>
        <PairingGraphic state={state.kind} />
      </View>

      {state.kind === 'searching' && <Text style={[typography.labelCaps, styles.status]}>SEARCHING FOR YOUR RING…</Text>}

      {state.kind === 'found' && (
        <Card style={styles.list}>
          <Text style={typography.caption}>Tap your ring to connect</Text>
          {state.rings.map((ring) => (
            <PressableOpacity key={ring.id} onPress={() => connect(ring)} accessibilityRole="button" style={styles.ringRow}>
              <Text style={typography.metricValue}>{ring.name}</Text>
              <Ionicons name="cellular" size={18} color={colors.good} accessibilityLabel="Strong signal" />
            </PressableOpacity>
          ))}
        </Card>
      )}

      {state.kind === 'connecting' && (
        <Text style={[typography.labelCaps, styles.status]}>CONNECTING TO {state.ring.name}…</Text>
      )}

      {state.kind === 'connected' && (
        <View style={styles.result}>
          <Text style={[typography.labelCaps, styles.connectedTitle]}>{state.ring.name} CONNECTED</Text>
          <Text style={[typography.body, styles.subtitle]}>Your ring is ready to go.</Text>
        </View>
      )}

      {state.kind === 'failed' && (
        <View style={styles.result}>
          <Text style={[typography.metricValue, styles.center]}>{state.message}</Text>
          <Text style={[typography.caption, styles.center]}>Make sure your ring is charged and close to your phone.</Text>
        </View>
      )}
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  graphic: { paddingVertical: spacing.xxxl },
  status: { textAlign: 'center', color: colors.textSecondary },
  list: { gap: spacing.md },
  ringRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  result: { alignItems: 'center', gap: spacing.sm },
  connectedTitle: { fontSize: 16, letterSpacing: 4, textAlign: 'center' },
  subtitle: { color: colors.textSecondary },
  center: { textAlign: 'center' },
  skip: { alignItems: 'center', paddingVertical: spacing.sm },
  skipText: { color: colors.textSecondary, fontSize: 12 },
});
