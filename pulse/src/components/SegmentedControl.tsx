import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { lightHaptic } from '@/utils/haptics';

import { PressableOpacity } from './PressableOpacity';

type SegmentedControlProps<Key extends string> = {
  options: { key: Key; label: string }[];
  value: Key;
  onChange: (key: Key) => void;
};

const HEIGHT = 36;

// A capsule of options with the selected one highlighted, e.g. HEART RATE | SPO2.
export function SegmentedControl<Key extends string>({ options, value, onChange }: SegmentedControlProps<Key>) {
  return (
    <View style={styles.capsule} accessibilityRole="tablist">
      {options.map((option) => {
        const selected = option.key === value;
        return (
          <PressableOpacity
            key={option.key}
            style={[styles.segment, selected && styles.selected]}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => {
              if (selected) return;
              lightHaptic();
              onChange(option.key);
            }}>
            <Text style={[typography.labelCaps, styles.label, !selected && styles.unselected]}>{option.label}</Text>
          </PressableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  capsule: {
    flexDirection: 'row',
    height: HEIGHT,
    padding: 3,
    borderRadius: HEIGHT / 2,
    backgroundColor: colors.card,
    borderColor: colors.cardStroke,
    borderWidth: 1,
  },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: HEIGHT / 2 },
  selected: { backgroundColor: colors.iconCircle },
  label: { fontSize: 12, paddingHorizontal: spacing.sm },
  unselected: { color: colors.textSecondary },
});
