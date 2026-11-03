import { useRouter } from 'expo-router';
import { useState, type ComponentRef, type ReactNode, type RefObject } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

import { DetailHeader } from './DetailHeader';
import { InfoSheet, type InfoSection } from './InfoSheet';
import { ScreenBackground } from './ScreenBackground';

export type DetailScrollRef = ComponentRef<typeof ScrollView>;

type DetailScreenProps = {
  title: string; // the selected day's label
  infoTitle: string;
  info: InfoSection[];
  scrollRef?: RefObject<DetailScrollRef | null>;
  children: ReactNode;
};

// The shared frame for Sleep, Recovery and Strain: header, scrolling content and info sheet.
export function DetailScreen({ title, infoTitle, info, scrollRef, children }: DetailScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
    <ScreenBackground>
      <DetailHeader title={title} onBack={() => router.back()} onInfo={() => setIsInfoOpen(true)} />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}>
        {children}
      </ScrollView>
      <InfoSheet visible={isInfoOpen} title={infoTitle} sections={info} onClose={() => setIsInfoOpen(false)} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.lg, gap: spacing.lg },
});
