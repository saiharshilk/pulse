import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { RingIllustration } from '@/components/RingIllustration';
import { SmallButton } from '@/components/SmallButton';
import { useAppStore } from '@/store/appStore';
import { showToast } from '@/store/toastStore';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import type { useDeviceViewModel } from './useDeviceViewModel';

type RingCardProps = { view: ReturnType<typeof useDeviceViewModel> };

// The ring's picture and status, plus SYNC NOW, SET RING TIME and RECONNECT.
export function RingCard({ view }: RingCardProps) {
  const sync = useAppStore((state) => state.sync);
  const setRingTime = useAppStore((state) => state.setRingTime);
  const reconnect = useAppStore((state) => state.reconnect);

  return (
    <Card style={styles.card}>
      <View style={styles.top}>
        <RingIllustration width={layout.ringIllustrationWidth} />
        <View style={styles.details}>
          <Text style={[typography.labelCaps, styles.name]}>{view.ringName}</Text>
          <View style={[styles.pill, { borderColor: view.status.color }]}>
            <View style={[styles.dot, { backgroundColor: view.status.color }]} />
            <Text style={[styles.pillText, { color: view.status.color }]}>{view.status.label}</Text>
          </View>
          {view.status.detail !== null && <Text style={typography.caption}>{view.status.detail}</Text>}
          <View style={styles.battery} accessibilityLabel={`Battery ${view.batteryText}`}>
            <Ionicons name={view.batteryIcon} size={18} color={view.batteryColor} />
            <Text style={[typography.metricValue, { color: view.batteryColor }]}>{view.batteryText}</Text>
          </View>
          <Text style={typography.caption}>{view.firmwareText}</Text>
          <Text style={typography.caption}>{view.lastSyncedText}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <SmallButton
          title="Sync now"
          busy={view.isSyncing}
          onPress={() => {
            sync()
              .then(() => showToast('Synced', 'success'))
              .catch(() => showToast("Couldn't sync with your ring.", 'warning'));
          }}
        />
        <SmallButton title="Set ring time" onPress={setRingTime} />
        {view.canReconnect && <SmallButton title="Reconnect" onPress={reconnect} />}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.lg },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  details: { flex: 1, gap: spacing.xs },
  name: { fontSize: 15 },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 12, fontWeight: '600' },
  battery: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.sm },
});
