import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';

type CardProps = { children: ReactNode; style?: StyleProp<ViewStyle> };

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.cardStroke,
    borderWidth: 1,
    borderRadius: layout.cardRadius,
    padding: layout.cardPadding,
  },
});
