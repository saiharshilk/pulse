import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PillButton } from '@/components/PillButton';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useAppStore } from '@/store/appStore';
import { showToast } from '@/store/toastStore';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { applyEdit, FIELD_LABELS, initialInput, inputUnit, SEX_OPTIONS, type ProfileFieldKey } from './profileFields';

type ProfileEditSheetProps = { field: ProfileFieldKey | null; onClose: () => void };

// Edits one profile field. Saving re-scores every day, since scores depend on the profile.
export function ProfileEditSheet({ field, onClose }: ProfileEditSheetProps) {
  return (
    <Modal visible={field !== null} transparent animationType="slide" onRequestClose={onClose}>
      {field !== null && <EditForm key={field} field={field} onClose={onClose} />}
    </Modal>
  );
}

function EditForm({ field, onClose }: { field: ProfileFieldKey; onClose: () => void }) {
  const profile = useAppStore((state) => state.profile);
  const units = useAppStore((state) => state.settings.units);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const insets = useSafeAreaInsets();
  const [text, setText] = useState(() => initialInput(field, profile, units));
  const [isAutoMaxHR, setIsAutoMaxHR] = useState(profile.maxHROverride === null);
  const [isSaving, setIsSaving] = useState(false);

  const result = applyEdit(field, text, profile, units, isAutoMaxHR);
  const error = 'error' in result ? result.error : null;

  function save() {
    if (!('profile' in result)) return;
    setIsSaving(true);
    updateProfile(result.profile)
      .then(() => {
        showToast('Profile saved', 'success');
        onClose();
      })
      .catch(() => showToast("Couldn't save your profile.", 'warning'))
      .finally(() => setIsSaving(false));
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Text style={[typography.labelCaps, styles.title]}>{FIELD_LABELS[field]}</Text>

        {field === 'sex' && <SegmentedControl options={SEX_OPTIONS} value={text} onChange={setText} />}

        {field === 'maxHROverride' && (
          <View style={styles.autoRow}>
            <Text style={typography.body}>Calculate from age</Text>
            <Switch
              value={isAutoMaxHR}
              onValueChange={setIsAutoMaxHR}
              trackColor={{ true: colors.good, false: colors.track }}
              accessibilityLabel="Calculate max heart rate from age"
            />
          </View>
        )}

        {field !== 'sex' && !(field === 'maxHROverride' && isAutoMaxHR) && (
          <View style={styles.inputRow}>
            <TextInput
              value={text}
              onChangeText={setText}
              autoFocus
              keyboardType={field === 'name' ? 'default' : field === 'sleepNeedBaselineHours' ? 'decimal-pad' : 'number-pad'}
              style={styles.input}
              placeholderTextColor={colors.textTertiary}
              accessibilityLabel={FIELD_LABELS[field]}
              returnKeyType="done"
              onSubmitEditing={save}
            />
            <Text style={typography.caption}>{inputUnit(field, units)}</Text>
          </View>
        )}

        <Text style={[typography.caption, styles.error]}>{error ?? ' '}</Text>
        <PillButton title={isSaving ? 'Saving…' : 'Save'} onPress={save} disabled={error !== null || isSaving} />
      </View>
    </KeyboardAvoidingView>
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
  autoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  input: {
    ...typography.metricValue,
    flex: 1,
    fontSize: 24,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.iconCircle,
  },
  error: { color: colors.warn },
});
