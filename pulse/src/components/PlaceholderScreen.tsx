import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { DetailHeader } from './DetailHeader';
import { ScreenBackground } from './ScreenBackground';

type PlaceholderScreenProps = {
  title: string;
  promptNumber: number;
  showBack?: boolean;
};

// Temporary stand-in for screens built in later prompts.
export function PlaceholderScreen({ title, promptNumber, showBack = false }: PlaceholderScreenProps) {
  const router = useRouter();
  return (
    <ScreenBackground>
      {showBack && <DetailHeader title={title} onBack={() => router.back()} />}
      <View style={styles.center}>
        <Text style={typography.screenTitle}>{title}</Text>
        <Text style={typography.caption}>{`Coming in Prompt ${promptNumber}`}</Text>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
});
