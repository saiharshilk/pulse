import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { PillButton } from '@/components/PillButton';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SEX_OPTIONS } from '@/features/device/profileFields';
import { parseNumberInput, validateProfile } from '@/features/device/profileValidation';
import { useAppStore } from '@/store/appStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { Sex } from '@/types/profile';
import type { Units } from '@/types/settings';
import { heightForInput, heightFromInput, weightForInput, weightFromInput } from '@/utils/units';

import { OnboardingFrame } from './OnboardingFrame';

const UNIT_OPTIONS: { key: Units; label: string }[] = [
  { key: 'metric', label: 'Metric' },
  { key: 'imperial', label: 'Imperial' },
];

const UNIT_WIDTH = 40;

type FieldProps = { label: string; value: string; onChange: (text: string) => void; unit?: string; error?: string; numeric?: boolean };

function Field({ label, value, onChange, unit, error, numeric = true }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={typography.labelCaps}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType={numeric ? 'number-pad' : 'default'}
          style={styles.input}
          accessibilityLabel={label}
          placeholderTextColor={colors.textTertiary}
        />
        {/* A fixed-width unit slot keeps every input the same width, with or without a unit. */}
        <Text style={[typography.caption, styles.unit]}>{unit ?? ''}</Text>
      </View>
      {error !== undefined && value !== '' && <Text style={[typography.caption, styles.error]}>{error}</Text>}
    </View>
  );
}

export function OnboardingProfileScreen() {
  const router = useRouter();
  const profile = useAppStore((state) => state.profile);
  const units = useAppStore((state) => state.settings.units);
  const setUnits = useAppStore((state) => state.setUnits);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const [name, setName] = useState(profile.name === 'Me' ? '' : profile.name);
  const [age, setAge] = useState(String(profile.age));
  const [sex, setSex] = useState<Sex>(profile.sex);
  const [height, setHeight] = useState(String(heightForInput(profile.heightCm, units)));
  const [weight, setWeight] = useState(String(weightForInput(profile.weightKg, units)));

  // Switching units converts what's already typed, so nothing is lost.
  function changeUnits(next: Units) {
    const heightCm = heightFromInput(parseNumberInput(height), units);
    const weightKg = weightFromInput(parseNumberInput(weight), units);
    if (Number.isFinite(heightCm)) setHeight(String(heightForInput(heightCm, next)));
    if (Number.isFinite(weightKg)) setWeight(String(weightForInput(weightKg, next)));
    setUnits(next);
  }

  const draft = {
    ...profile,
    name: name.trim(),
    age: parseNumberInput(age),
    sex,
    heightCm: heightFromInput(parseNumberInput(height), units),
    weightKg: weightFromInput(parseNumberInput(weight), units),
  };
  const errors = validateProfile(draft);
  const isValid = Object.keys(errors).length === 0;

  return (
    <OnboardingFrame
      footer={
        <PillButton
          title="Continue"
          disabled={!isValid}
          onPress={() => {
            updateProfile({ ...draft, age: Math.round(draft.age), heightCm: Math.round(draft.heightCm), weightKg: Math.round(draft.weightKg) })
              .then(() => router.push('/onboarding/pair'))
              .catch(() => undefined);
          }}
        />
      }>
      <Text style={typography.screenTitle}>About you</Text>
      <Text style={typography.caption}>PULSE uses these to set your heart-rate zones, calories and sleep need.</Text>
      <Field label="Name" value={name} onChange={setName} numeric={false} error={errors.name} />
      <Field label="Age" value={age} onChange={setAge} unit="years" error={errors.age} />
      <View style={styles.field}>
        <Text style={typography.labelCaps}>Sex</Text>
        <SegmentedControl options={SEX_OPTIONS} value={sex} onChange={setSex} />
      </View>
      <SegmentedControl options={UNIT_OPTIONS} value={units} onChange={changeUnits} />
      <Field label="Height" value={height} onChange={setHeight} unit={units === 'metric' ? 'cm' : 'in'} error={errors.heightCm} />
      <Field label="Weight" value={weight} onChange={setWeight} unit={units === 'metric' ? 'kg' : 'lb'} error={errors.weightKg} />
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.sm },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  input: {
    ...typography.body,
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderColor: colors.cardStroke,
    borderWidth: 1,
  },
  unit: { width: UNIT_WIDTH },
  error: { color: colors.warn },
});
