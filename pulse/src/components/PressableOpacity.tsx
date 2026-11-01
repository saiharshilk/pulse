import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { layout } from '@/theme/layout';

type PressableOpacityProps = Omit<PressableProps, 'style'> & { style?: StyleProp<ViewStyle> };

// A Pressable that dims while pressed. Every tappable element uses this.
export function PressableOpacity({ style, ...rest }: PressableOpacityProps) {
  return (
    <Pressable
      {...rest}
      style={({ pressed }) => [style, pressed && { opacity: layout.pressedOpacity }]}
    />
  );
}
