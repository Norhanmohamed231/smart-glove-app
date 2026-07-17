import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { BookOpen, Brain, Grid3x3, History, Play, Bluetooth } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { ThemeColors } from '@/src/theme/theme';

interface HomeMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onManageConnection: () => void;
}

interface MenuItem {
  label: string;
  description: string;
  href?: Href;
  icon: React.ReactNode;
  onPress?: () => void;
}

export function HomeMenuModal({ visible, onClose, onManageConnection }: HomeMenuModalProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const navigate = (href: Href) => {
    onClose();
    router.push(href);
  };

  const items: MenuItem[] = [
    {
      label: 'Start Translation',
      description: 'Choose AI or Binary mode',
      href: '/choose-mode',
      icon: <Play size={20} color={colors.primary} />,
    },
    {
      label: 'AI Mode',
      description: 'LSTM gesture recognition',
      href: '/ai-mode',
      icon: <Brain size={20} color={colors.primary} />,
    },
    {
      label: 'Binary Mode',
      description: '5-bit dictionary translation',
      href: '/binary-mode',
      icon: <Grid3x3 size={20} color={colors.tagBinary} />,
    },
    {
      label: 'Customize Dictionary',
      description: 'Edit your 32 gesture phrases',
      href: '/binary-dictionary' as Href,
      icon: <BookOpen size={20} color={colors.tagBinary} />,
    },
    {
      label: 'View History',
      description: 'Past translations and speech',
      href: '/history',
      icon: <History size={20} color={colors.textMain} />,
    },
    {
      label: 'Manage Glove',
      description: 'Scan and connect SignGlove',
      icon: <Bluetooth size={20} color={colors.primary} />,
      onPress: () => {
        onClose();
        onManageConnection();
      },
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Menu</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {items.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuRow}
              activeOpacity={0.85}
              onPress={() => {
                if (item.onPress) {
                  item.onPress();
                  return;
                }
                if (item.href) {
                  navigate(item.href);
                }
              }}
            >
              <View style={styles.iconWrap}>{item.icon}</View>
              <View style={styles.textWrap}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-start',
      paddingTop: 72,
      paddingHorizontal: 20,
    },
    sheet: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    sheetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    sheetTitle: {
      color: colors.textMain,
      fontSize: 18,
      fontWeight: '800',
    },
    closeText: {
      color: colors.textMuted,
      fontSize: 20,
      padding: 4,
    },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 14,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.surfaceAlt,
      justifyContent: 'center',
      alignItems: 'center',
    },
    textWrap: {
      flex: 1,
      gap: 2,
    },
    menuLabel: {
      color: colors.textMain,
      fontSize: 15,
      fontWeight: '700',
    },
    menuDescription: {
      color: colors.textDescription,
      fontSize: 12,
    },
  });
