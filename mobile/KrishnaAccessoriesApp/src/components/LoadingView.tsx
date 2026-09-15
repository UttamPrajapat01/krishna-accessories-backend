import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

export const LoadingView: React.FC<{ message?: string }> = ({ message = 'Loading luxury catalog...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.goldPrimary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  text: {
    marginTop: 14,
    color: Colors.goldLight,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
