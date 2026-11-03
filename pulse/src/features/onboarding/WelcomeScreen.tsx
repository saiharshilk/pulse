import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FadeInSection } from '@/components/FadeInSection';
import { Logo } from '@/components/Logo';
import { PillButton } from '@/components/PillButton';
import { APP_NAME } from '@/config/appConfig';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { OnboardingFrame } from './OnboardingFrame';

const BULLETS: { icon: ComponentProps<typeof Ionicons>['name']; color: string; title: string; body: string }[] = [
  { icon: 'moon', color: colors.sleep, title: 'Sleep', body: 'See how long you slept and how much you needed.' },
  { icon: 'pulse', color: colors.recoveryGreen, title: 'Recovery', body: 'Know how ready your body is each morning.' },
  { icon: 'flash', color: colors.strain, title: 'Strain', body: 'Track the load of your day and when to push.' },
];

export function WelcomeScreen() {
  const router = useRouter();
  return (
    <OnboardingFrame footer={<PillButton title="Continue" onPress={() => router.push('/onboarding/profile')} />}>
      <FadeInSection index={0}>
        <View style={styles.hero}>
          <Logo size={layout.logoSize} />
          <Text style={typography.wordmark}>{APP_NAME}</Text>
          <Text style={[typography.body, styles.tagline]}>Your ring. Your recovery.</Text>
        </View>
      </FadeInSection>
      {BULLETS.map((bullet, i) => (
        <FadeInSection key={bullet.title} index={i + 1}>
          <View style={styles.bullet}>
            <View style={styles.icon}>
              <Ionicons name={bullet.icon} size={20} color={bullet.color} />
            </View>
            <View style={styles.bulletText}>
              <Text style={typography.labelCaps}>{bullet.title}</Text>
              <Text style={typography.caption}>{bullet.body}</Text>
            </View>
          </View>
        </FadeInSection>
      ))}
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.xxl },
  tagline: { color: colors.textSecondary },
  bullet: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  icon: {
    width: layout.iconCircle + 8,
    height: layout.iconCircle + 8,
    borderRadius: (layout.iconCircle + 8) / 2,
    backgroundColor: colors.iconCircle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletText: { flex: 1, gap: 2 },
});
