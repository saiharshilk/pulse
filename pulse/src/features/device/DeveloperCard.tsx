import { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { SectionHeader } from '@/components/SectionHeader';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SmallButton } from '@/components/SmallButton';
import { useAppStore } from '@/store/appStore';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { MOCK_HISTORY_DAY_OPTIONS, type MockHistoryDays } from '@/types/settings';

const DAY_OPTIONS = MOCK_HISTORY_DAY_OPTIONS.map((days) => ({ key: `${days}` as const, label: `${days} days` }));
const RESET_MESSAGE = 'This deletes all your data and settings and starts setup again. It can’t be undone.';

// Asks before deleting everything. Web has no native alert with buttons, so it uses confirm().
function confirmReset(onConfirm: () => void): void {
  if (Platform.OS === 'web') {
    if (globalThis.confirm(RESET_MESSAGE)) onConfirm();
    return;
  }
  Alert.alert('Reset everything?', RESET_MESSAGE, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Reset', style: 'destructive', onPress: onConfirm },
  ]);
}

type DeveloperCardProps = { versionText: string; buildText: string };

export function DeveloperCard({ versionText, buildText }: DeveloperCardProps) {
  const mockHistoryDays = useAppStore((state) => state.settings.mockHistoryDays);
  const setMockHistoryDays = useAppStore((state) => state.setMockHistoryDays);
  const regenerateMockData = useAppStore((state) => state.regenerateMockData);
  const resetEverything = useAppStore((state) => state.resetEverything);
  const [isRegenerating, setIsRegenerating] = useState(false);

  return (
    <Card style={styles.card}>
      <SectionHeader title="Developer" />
      <Text style={typography.caption}>Days of mock history</Text>
      <SegmentedControl
        options={DAY_OPTIONS}
        value={`${mockHistoryDays}`}
        onChange={(key) => setMockHistoryDays(Number(key) as MockHistoryDays)}
      />
      <Text style={typography.caption}>Applies the next time you regenerate mock data.</Text>
      <View style={styles.actions}>
        <SmallButton
          title="Regenerate mock data"
          busy={isRegenerating}
          onPress={() => {
            setIsRegenerating(true);
            regenerateMockData().finally(() => setIsRegenerating(false));
          }}
        />
      </View>
      <View style={styles.actions}>
        <SmallButton title="Reset everything" tone="danger" onPress={() => confirmReset(resetEverything)} />
      </View>
      <View style={styles.version}>
        <Text style={typography.caption}>{versionText}</Text>
        <Text style={typography.caption}>{buildText}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  actions: { flexDirection: 'row' },
  version: { gap: 2, marginTop: spacing.sm },
});
