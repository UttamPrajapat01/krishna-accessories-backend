import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  description?: string;
  actionText?: string;
  buttonTitle?: string;
  onAction?: () => void;
  onButtonPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'bag-outline',
  title,
  message,
  description,
  actionText,
  buttonTitle,
  onAction,
  onButtonPress,
}) => {
  const effectiveMessage = message || description || '';
  const effectiveActionText = buttonTitle || actionText;
  const effectiveOnAction = onButtonPress || onAction;

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={36} color={Colors.goldPrimary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {effectiveMessage ? <Text style={styles.message}>{effectiveMessage}</Text> : null}
      {effectiveActionText && effectiveOnAction && (
        <Button
          title={effectiveActionText}
          onPress={effectiveOnAction}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    flex: 1,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    minWidth: 180,
  },
});
