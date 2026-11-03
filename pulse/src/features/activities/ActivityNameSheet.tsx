import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PillButton } from '@/components/PillButton';
import { PressableOpacity } from '@/components/PressableOpacity';
import { useAppStore } from '@/store/appStore';
import { showToast } from '@/store/toastStore';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { ACTIVITY_NAME_MAX_LENGTH, ACTIVITY_PRESETS, activityIcon } from './activityIcons';

export type RenameTarget = { id: string; name: string };

type ActivityNameSheetProps = { target: RenameTarget | null; onClose: () => void };

// Lets you name a detected activity: pick a preset or type your own.
export function ActivityNameSheet({ target, onClose }: ActivityNameSheetProps) {
  return (
    <Modal visible={target !== null} transparent animationType="slide" onRequestClose={onClose}>
      {target !== null && <NameForm key={target.id} target={target} onClose={onClose} />}
    </Modal>
  );
}

function NameForm({ target, onClose }: { target: RenameTarget; onClose: () => void }) {
  const renameActivity = useAppStore((state) => state.renameActivity);
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(target.name);
  const trimmed = name.trim();

  function save(chosen: string) {
    renameActivity(target.id, chosen)
      .then(() => {
        showToast(`Saved as ${chosen}`, 'success');
        onClose();
      })
      .catch(() => showToast("Couldn't save the name.", 'warning'));
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Text style={[typography.labelCaps, styles.title]}>Name this activity</Text>
        <View style={styles.chips}>
          {ACTIVITY_PRESETS.map((preset) => {
            const selected = preset === trimmed;
            return (
              <PressableOpacity
                key={preset}
                onPress={() => save(preset)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[styles.chip, selected && styles.chipSelected]}>
                <Ionicons name={activityIcon(preset)} size={16} color={colors.textPrimary} />
                <Text style={typography.body}>{preset}</Text>
              </PressableOpacity>
            );
          })}
        </View>
        <TextInput
          value={name}
          onChangeText={setName}
          maxLength={ACTIVITY_NAME_MAX_LENGTH}
          placeholder="Or type your own"
          placeholderTextColor={colors.textTertiary}
          style={styles.input}
          accessibilityLabel="Custom activity name"
          returnKeyType="done"
          onSubmitEditing={() => trimmed !== '' && save(trimmed)}
        />
        <PillButton title="Save" disabled={trimmed === ''} onPress={() => save(trimmed)} />
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 18,
    backgroundColor: colors.iconCircle,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: { borderColor: colors.textPrimary },
  input: {
    ...typography.body,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.iconCircle,
  },
});
