import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../theme/colors';

interface BadgeProps {
  label?: string;
  text?: string;
  type?: 'gold' | 'success' | 'warning' | 'danger' | 'info' | 'error' | 'default';
  variant?: 'gold' | 'success' | 'warning' | 'danger' | 'info' | 'error' | 'default';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, text, type, variant, style }) => {
  const effectiveLabel = text || label || '';
  const effectiveType = variant || type || 'gold';

  const getBadgeColors = () => {
    switch (effectiveType) {
      case 'gold':
        return { bg: 'rgba(212, 175, 55, 0.15)', text: Colors.goldLight, border: Colors.borderGold };
      case 'success':
        return { bg: 'rgba(52, 199, 89, 0.15)', text: Colors.success, border: 'rgba(52, 199, 89, 0.3)' };
      case 'warning':
        return { bg: 'rgba(255, 159, 10, 0.15)', text: Colors.warning, border: 'rgba(255, 159, 10, 0.3)' };
      case 'danger':
      case 'error':
        return { bg: 'rgba(255, 69, 58, 0.15)', text: Colors.danger, border: 'rgba(255, 69, 58, 0.3)' };
      case 'info':
        return { bg: 'rgba(100, 210, 255, 0.15)', text: Colors.info, border: 'rgba(100, 210, 255, 0.3)' };
      default:
        return { bg: Colors.card, text: Colors.textMuted, border: Colors.border };
    }
  };

  const c = getBadgeColors();

  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border }, style]}>
      <Text style={[styles.text, { color: c.text }]}>{effectiveLabel}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
