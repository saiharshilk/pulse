import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { PillButton } from './PillButton';

export type InfoSection = { title: string; body: string };

type InfoSheetProps = {
  visible: boolean;
  title: string;
  sections: InfoSection[];
  onClose: () => void;
};

// A dark card that slides up from the bottom and explains a screen's metrics.
export function InfoSheet({ visible, title, sections, onClose }: InfoSheetProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <View
          style={[
            styles.sheet,
            { maxHeight: height * layout.sheetMaxHeightRatio, paddingBottom: insets.bottom + spacing.lg },
          ]}>
          <Text style={[typography.labelCaps, styles.title]}>{title}</Text>
          <ScrollView contentContainerStyle={styles.sections} showsVerticalScrollIndicator={false}>
            {sections.map((section) => (
              <View key={section.title} style={styles.section}>
                <Text style={typography.metricValue}>{section.title}</Text>
                <Text style={[typography.body, styles.body]}>{section.body}</Text>
              </View>
            ))}
          </ScrollView>
          <PillButton title="Got it" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.sheetBackdrop },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: layout.sheetRadius,
    borderTopRightRadius: layout.sheetRadius,
    borderColor: colors.cardStroke,
    borderWidth: 1,
    padding: layout.cardPadding,
    gap: spacing.lg,
  },
  title: { textAlign: 'center' },
  sections: { gap: spacing.xl },
  section: { gap: spacing.xs },
  body: { color: colors.textSecondary, fontSize: 15, lineHeight: 21 },
});
