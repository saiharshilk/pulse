import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { typography } from '@/theme/typography';

import { PressableOpacity } from './PressableOpacity';

type DetailHeaderProps = { title: string; onBack: () => void; onInfo?: () => void };

const SIDE_WIDTH = 44;

export function DetailHeader({ title, onBack, onInfo }: DetailHeaderProps) {
  return (
    <View style={styles.row}>
      <PressableOpacity onPress={onBack} style={styles.side} accessibilityLabel="Go back">
        <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
      </PressableOpacity>
      <Text style={[typography.labelCaps, styles.title]} numberOfLines={1}>
        {title}
      </Text>
      {onInfo === undefined ? (
        <View style={styles.side} />
      ) : (
        <PressableOpacity onPress={onInfo} style={[styles.side, styles.info]} accessibilityLabel="More information">
          <Ionicons name="information-circle-outline" size={22} color={colors.textPrimary} />
        </PressableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: SIDE_WIDTH,
    paddingHorizontal: layout.screenPadding,
  },
  side: { width: SIDE_WIDTH, height: SIDE_WIDTH, justifyContent: 'center' },
  info: { alignItems: 'flex-end' },
  title: { flex: 1, textAlign: 'center' },
});
