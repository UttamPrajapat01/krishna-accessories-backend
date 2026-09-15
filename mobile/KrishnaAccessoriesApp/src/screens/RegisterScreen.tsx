import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Required Fields', 'Please complete your name, email, and password.');
      return;
    }

    try {
      setLoading(true);
      await register(fullName.trim(), email.trim(), password, phoneNumber.trim() || undefined);
      navigation.replace('MainTabs');
    } catch (err: any) {
      Alert.alert('Registration Failed', err.response?.data?.message || 'Could not register account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>

      <Text style={styles.title}>Join the Circle</Text>
      <Text style={styles.subtitle}>Register for an exclusive luxury shopping experience</Text>

      <View style={styles.form}>
        <Input
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
          placeholder="e.g. Vikramaditya Singhania"
          leftIcon={<Ionicons name="person-outline" size={18} color={Colors.goldPrimary} />}
        />

        <Input
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="client@luxury.com"
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={<Ionicons name="mail-outline" size={18} color={Colors.goldPrimary} />}
        />

        <Input
          label="Mobile Phone (10 digits)"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="9876543210"
          keyboardType="phone-pad"
          leftIcon={<Ionicons name="call-outline" size={18} color={Colors.goldPrimary} />}
        />

        <Input
          label="Create Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Minimum 6 characters"
          secureTextEntry
          leftIcon={<Ionicons name="lock-closed-outline" size={18} color={Colors.goldPrimary} />}
        />

        <Button
          title="Create Exclusive Account"
          onPress={handleRegister}
          loading={loading}
          style={styles.submitBtn}
        />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already registered?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}> Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
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
  submitBtn: {
    marginTop: 10,
    marginBottom: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  loginLink: {
    color: Colors.goldPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
});
