// Every haptic in the app goes through here, so the feel stays consistent.
// Haptics are a nicety: a device without them should simply feel nothing.
import * as Haptics from 'expo-haptics';

// Taps, tab changes, switching options.
export function lightHaptic(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

// Something finished well: a ring paired, a reading saved.
export function successHaptic(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}

// Something went wrong: a failed sync, a failed reading.
export function warningHaptic(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
}
