import React from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureIllustration } from '@/src/components/GestureIllustration';
import { formatFingerBits } from '@/src/features/binary/gestureIllustrations';
import type { DictionaryEntry } from '@/src/features/binary/types';
import { ttsService } from '@/src/features/tts/TTSService';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { ThemeColors } from '@/src/theme/theme';

interface DictionaryEditModalProps {
  visible: boolean;
  entry: DictionaryEntry | null;
  onClose: () => void;
  onSave: (phrase: string, english: string) => Promise<boolean>;
  onReset: () => Promise<void>;
}

export function DictionaryEditModal({
  visible,
  entry,
  onClose,
  onSave,
  onReset,
}: DictionaryEditModalProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const scrollRef = React.useRef<ScrollView>(null);
  const englishInputRef = React.useRef<TextInput>(null);

  const [phrase, setPhrase] = React.useState('');
  const [english, setEnglish] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [keyboardVisible, setKeyboardVisible] = React.useState(false);

  React.useEffect(() => {
    if (!entry) return;
    setPhrase(entry.phrase);
    setEnglish(entry.english);
  }, [entry]);

  React.useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (!entry) return null;

  const illustrationSize = keyboardVisible ? 80 : 120;

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  const handleSave = async () => {
    Keyboard.dismiss();
    setIsSaving(true);
    const ok = await onSave(phrase, english);
    setIsSaving(false);

    if (ok) {
      onClose();
      return;
    }

    Alert.alert('Invalid input', 'Arabic phrase is required (max 120 characters).');
  };

  const handleReset = () => {
    Alert.alert('Reset entry', 'Restore this gesture to the default phrase?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          Keyboard.dismiss();
          await onReset();
          onClose();
        },
      },
    ]);
  };

  const handleTestSpeech = () => {
    const trimmed = phrase.trim();
    if (!trimmed) return;
    void ttsService.speak(trimmed, true);
  };

  const scrollToEnglishField = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={[styles.sheet, { maxHeight: keyboardVisible ? '88%' : '92%' }]}>
          <ScrollView
            ref={scrollRef}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 16) + (keyboardVisible ? 24 : 8) },
            ]}
          >
            <Text style={styles.title}>Edit Gesture {entry.bits}</Text>

            <View style={styles.illustrationBlock}>
              <GestureIllustration bits={entry.bits} size={illustrationSize} />
              {!keyboardVisible ? (
                <Text style={styles.fingerLabel}>{formatFingerBits(entry.bits)}</Text>
              ) : null}
            </View>

            <Text style={styles.fieldLabel}>Arabic phrase *</Text>
            <TextInput
              style={styles.input}
              value={phrase}
              onChangeText={setPhrase}
              placeholder="كلمة أو جملة كاملة"
              placeholderTextColor={colors.textMuted}
              multiline
              textAlign="right"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => englishInputRef.current?.focus()}
              onFocus={() => scrollRef.current?.scrollTo({ y: 120, animated: true })}
            />

            <Text style={styles.fieldLabel}>English translation</Text>
            <TextInput
              ref={englishInputRef}
              style={styles.input}
              value={english}
              onChangeText={setEnglish}
              placeholder="Optional English translation"
              placeholderTextColor={colors.textMuted}
              multiline
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              onFocus={scrollToEnglishField}
            />

            <View style={styles.actions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleTestSpeech}>
                <Text style={styles.secondaryButtonText}>Test Speech</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleReset}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footerActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
    },
    sheet: {
      backgroundColor: colors.backgroundMid,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    title: {
      color: colors.textMain,
      fontSize: 18,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 12,
    },
    illustrationBlock: {
      alignItems: 'center',
      marginBottom: 14,
    },
    fingerLabel: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 8,
    },
    fieldLabel: {
      color: colors.textDescription,
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      borderRadius: 14,
      color: colors.textMain,
      fontSize: 15,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 14,
      minHeight: 48,
      maxHeight: 120,
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 16,
    },
    secondaryButton: {
      flex: 1,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      backgroundColor: colors.surface,
      paddingVertical: 12,
      alignItems: 'center',
    },
    secondaryButtonText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '700',
    },
    resetButtonText: {
      color: '#EF4444',
      fontSize: 14,
      fontWeight: '700',
    },
    footerActions: {
      flexDirection: 'row',
      gap: 10,
    },
    cancelButton: {
      flex: 1,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      backgroundColor: colors.surfaceAlt,
    },
    cancelButtonText: {
      color: colors.textDescription,
      fontSize: 15,
      fontWeight: '700',
    },
    saveButton: {
      flex: 1,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      backgroundColor: colors.primary,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '800',
    },
  });
