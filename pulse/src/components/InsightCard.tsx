import { StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { Card } from './Card';
import { PressableOpacity } from './PressableOpacity';

type InsightCardProps = { text: string; linkText?: string; onLinkPress?: () => void };

export function InsightCard({ text, linkText, onLinkPress }: InsightCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={typography.body}>{text}</Text>
      {linkText !== undefined && (
        <PressableOpacity onPress={onLinkPress}>
          <Text style={styles.link}>{linkText}</Text>
        </PressableOpacity>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.lg },
  link: { ...typography.labelCaps, fontSize: 12, color: colors.link },
});
