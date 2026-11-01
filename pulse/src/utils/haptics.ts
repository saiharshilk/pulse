import * as Haptics from 'expo-haptics';

export function lightHaptic(): void {
  // Haptics are a nicety: a device without them should simply feel nothing.
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}
