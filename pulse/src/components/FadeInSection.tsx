import type { ReactNode } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { layout } from '@/theme/layout';

type FadeInSectionProps = {
  index: number; // later sections start a little later
  children: ReactNode;
  onLayout?: (event: LayoutChangeEvent) => void; // lets a screen scroll to this section
};

export function FadeInSection({ index, children, onLayout }: FadeInSectionProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(layout.sectionFadeMs).delay(index * layout.sectionFadeStaggerMs)}
      onLayout={onLayout}>
      {children}
    </Animated.View>
  );
}
