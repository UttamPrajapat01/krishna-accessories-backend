import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export const ForgotPasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleReset = () => {
    if (!email) {
      Alert.alert('Required', 'Please enter your registered email address.');
      return;
    }
    setSubmitted(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>

      <Text style={styles.title}>Password Recovery</Text>
      <Text style={styles.subtitle}>Enter your email to receive an instant security code</Text>

      {submitted ? (
        <View style={styles.successCard}>
          <Ionicons name="mail-unread-outline" size={48} color={Colors.goldPrimary} />
          <Text style={styles.successTitle}>Recovery Instructions Sent</Text>
          <Text style={styles.successText}>
            We have dispatched password reset instructions to {email}. Check your inbox.
          </Text>
          <Button
            title="Return to Sign In"
            onPress={() => navigation.navigate('Login')}
            style={{ width: '100%', marginTop: 20 }}
          />
        </View>
      ) : (
        <View style={styles.form}>
          <Input
            label="Registered Email"
            value={email}
            onChangeText={setEmail}
            placeholder="client@luxury.com"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Ionicons name="mail-outline" size={18} color={Colors.goldPrimary} />}
          />

          <Button
            title="Send Recovery Link"
            onPress={handleReset}
            style={{ marginTop: 10 }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
    paddingTop: 50,
  },
  backBtn: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
    marginBottom: 28,
  },
  form: {
    width: '100%',
  },
  successCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 14,
    marginBottom: 8,
  },
  successText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
