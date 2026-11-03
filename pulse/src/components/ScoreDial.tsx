import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { lightHaptic } from '@/utils/haptics';
import { NO_VALUE } from '@/utils/format';

import { PressableOpacity } from './PressableOpacity';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type ScoreDialProps = {
  value: number;
  maxValue: number;
  color: string;
  label: string;
  size: number;
  valueText?: string; // the text in the center; defaults to the value itself
  suffix?: string;
  placeholder?: boolean; // shows "—" with an empty arc
  large?: boolean; // detail screens use the bigger value text
  topLabel?: string; // small text inside the dial, above the value
  accessibilityLabel?: string; // e.g. "Recovery 72 percent, green"
  onPress?: () => void;
};

export function ScoreDial({
  value,
  maxValue,
  color,
  label,
  size,
  valueText,
  suffix,
  placeholder = false,
  large = false,
  topLabel,
  accessibilityLabel,
  onPress,
}: ScoreDialProps) {
  const strokeWidth = size * layout.dialStrokeRatio;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const targetProgress = placeholder ? 0 : Math.min(1, Math.max(0, value / maxValue));

  // TODO(spec): the spec's 44pt value doesn't fit "12.4" in a Home dial of about 107pt, so text
  // scales with the dial and stops at the spec size on larger dials.
  const valueStyle = large ? typography.bigDialValue : typography.dialValue;
  const suffixStyle = large ? typography.bigDialSuffix : typography.dialSuffix;
  const valueFontSize = Math.min(valueStyle.fontSize, size * layout.dialValueSizeRatio);
  const suffixFontSize = Math.min(suffixStyle.fontSize, size * layout.dialSuffixSizeRatio);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(
      withTiming(targetProgress, { duration: layout.dialAnimationMs, easing: Easing.out(Easing.cubic) }),
    );
  }, [progress, targetProgress]);

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.get()),
    // A round cap would draw a dot at 12 o'clock even at zero, so hide the arc there.
    strokeOpacity: progress.get() > 0.001 ? 1 : 0,
  }));

  function handlePress() {
    lightHaptic();
    onPress?.();
  }

  return (
    <PressableOpacity
      onPress={handlePress}
      disabled={onPress === undefined}
      accessible
      accessibilityRole={onPress === undefined ? 'image' : 'button'}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={onPress === undefined ? undefined : 'Opens details'}
      style={[styles.root, { width: size }]}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle cx={center} cy={center} r={radius} stroke={colors.track} strokeWidth={strokeWidth} fill="none" />
          <AnimatedCircle
            animatedProps={arcProps}
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            fill="none"
            // SVG circles start at 3 o'clock; turn back a quarter to start at 12.
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>
        <View style={[styles.center, { paddingHorizontal: strokeWidth }]}>
          {topLabel !== undefined && (
            <Text style={[typography.wordmark, styles.topLabel, { fontSize: size * layout.bigDialTopLabelRatio }]}>
              {topLabel}
            </Text>
          )}
          <Text
            style={[valueStyle, { fontSize: valueFontSize }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
            maxFontSizeMultiplier={1.2}>
            {placeholder ? NO_VALUE : (valueText ?? String(value))}
            {!placeholder && suffix !== undefined && <Text style={[suffixStyle, { fontSize: suffixFontSize }]}>{suffix}</Text>}
          </Text>
        </View>
      </View>
      <View style={styles.labelRow}>
        <Text style={[typography.labelCaps, styles.label]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
          {label}
        </Text>
        {onPress !== undefined && <Ionicons name="chevron-forward" size={12} color={colors.textSecondary} />}
      </View>
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center' },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: spacing.md },
  label: { flexShrink: 1 },
  topLabel: { letterSpacing: 3 },
});
