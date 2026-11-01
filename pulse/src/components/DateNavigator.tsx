import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { lightHaptic } from '@/utils/haptics';

import { PressableOpacity } from './PressableOpacity';

type DateNavigatorProps = {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
};

const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

export function DateNavigator({ label, onPrev, onNext, canPrev, canNext }: DateNavigatorProps) {
  function press(action: () => void) {
    lightHaptic();
    action();
  }

  return (
    <View style={styles.capsule}>
      <PressableOpacity onPress={() => press(onPrev)} disabled={!canPrev} hitSlop={HIT_SLOP} accessibilityLabel="Previous day">
        <Ionicons name="chevron-back" size={16} color={canPrev ? colors.textPrimary : colors.textTertiary} />
      </PressableOpacity>
      <Text style={[typography.labelCaps, styles.label]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        {label}
      </Text>
      <PressableOpacity onPress={() => press(onNext)} disabled={!canNext} hitSlop={HIT_SLOP} accessibilityLabel="Next day">
        <Ionicons name="chevron-forward" size={16} color={canNext ? colors.textPrimary : colors.textTertiary} />
      </PressableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  capsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderColor: colors.cardStroke,
    borderWidth: 1,
  },
  label: { flexShrink: 1, textAlign: 'center' },
});
