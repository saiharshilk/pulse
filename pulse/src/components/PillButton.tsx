import { StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { PressableOpacity } from './PressableOpacity';

type PillButtonProps = { title: string; onPress: () => void; disabled?: boolean };

export function PillButton({ title, onPress, disabled = false }: PillButtonProps) {
  return (
    <PressableOpacity onPress={onPress} disabled={disabled} style={[styles.pill, disabled && styles.disabled]}>
      <Text style={[typography.labelCaps, disabled && styles.disabledText]}>{title}</Text>
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.textPrimary,
  },
  disabled: { borderColor: colors.textTertiary },
  disabledText: { color: colors.textTertiary },
});
