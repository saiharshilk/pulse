import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { PressableOpacity } from './PressableOpacity';

type SmallButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean; // shows a spinner instead of the title
  tone?: 'default' | 'danger';
};

// A compact outlined button for rows of actions.
export function SmallButton({ title, onPress, disabled = false, busy = false, tone = 'default' }: SmallButtonProps) {
  const color = tone === 'danger' ? colors.recoveryRed : colors.textPrimary;
  const isDisabled = disabled || busy;
  return (
    <PressableOpacity
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy }}
      style={[styles.button, { borderColor: isDisabled ? colors.textTertiary : color }]}>
      {busy ? (
        <ActivityIndicator size="small" color={colors.textPrimary} />
      ) : (
        <Text style={[styles.title, { color: isDisabled ? colors.textTertiary : color }]} numberOfLines={1} adjustsFontSizeToFit>
          {title}
        </Text>
      )}
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  title: { ...typography.labelCaps, fontSize: 11, letterSpacing: 1 },
});
