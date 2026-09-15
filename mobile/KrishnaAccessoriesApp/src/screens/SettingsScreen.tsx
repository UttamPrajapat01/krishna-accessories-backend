import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [exclusiveDrops, setExclusiveDrops] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  const handleClearCache = () => {
    Alert.alert('Clear Cache', 'Cached images and catalog data cleared successfully.');
  };

  const handleOpenLegal = (title: string, content: string) => {
    Alert.alert(title, content, [{ text: 'Done' }]);
  };

  return (
    <View style={styles.container}>
      <Header
        title="SETTINGS"
        showBack
        onBack={() => navigation.goBack()}
        showSearch
        showCart
        showAccount
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Notifications Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>NOTIFICATIONS & ALERTS</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingTitle}>Order Status Updates</Text>
              <Text style={styles.settingDesc}>Real-time dispatch and delivery alerts</Text>
            </View>
            <Switch
              value={orderAlerts}
              onValueChange={setOrderAlerts}
              trackColor={{ false: Colors.card, true: Colors.accent }}
              thumbColor={Colors.text}
            />
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingTitle}>Exclusive VIP Drops</Text>
              <Text style={styles.settingDesc}>Early access notifications for rare editions</Text>
            </View>
            <Switch
              value={exclusiveDrops}
              onValueChange={setExclusiveDrops}
              trackColor={{ false: Colors.card, true: Colors.accent }}
              thumbColor={Colors.text}
            />
          </View>
        </View>

        {/* Security & System */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>SECURITY & PREFERENCES</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingTitle}>Biometric Authentication</Text>
              <Text style={styles.settingDesc}>Use Face ID / Fingerprint for instant checkout</Text>
            </View>
            <Switch
              value={biometrics}
              onValueChange={setBiometrics}
              trackColor={{ false: Colors.card, true: Colors.accent }}
              thumbColor={Colors.text}
            />
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingTitle}>Haptic Feedback</Text>
              <Text style={styles.settingDesc}>Subtle vibration on tactile button presses</Text>
            </View>
            <Switch
              value={hapticFeedback}
              onValueChange={setHapticFeedback}
              trackColor={{ false: Colors.card, true: Colors.accent }}
              thumbColor={Colors.text}
            />
          </View>
        </View>

        {/* Localization & Cache */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>APP CONFIGURATION</Text>

          <View style={styles.menuRow}>
            <Text style={styles.menuTitle}>Store Currency</Text>
            <Text style={styles.menuValue}>INR (₹)</Text>
          </View>

          <View style={styles.menuRow}>
            <Text style={styles.menuTitle}>Language</Text>
            <Text style={styles.menuValue}>English (UK/IN)</Text>
          </View>

          <TouchableOpacity style={[styles.menuRow, { borderBottomWidth: 0 }]} onPress={handleClearCache}>
            <Text style={styles.menuTitle}>Clear Image Cache</Text>
            <Text style={[styles.menuValue, { color: Colors.accent }]}>Purge (24 MB)</Text>
          </TouchableOpacity>
        </View>

        {/* Legal & Compliance */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>LEGAL & COMPLIANCE</Text>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() =>
              handleOpenLegal(
                'Terms of Service',
                'All sales of authentic luxury timepieces, leather goods, and jewelry are governed by Krishna Accessories bespoke retail standards. Authenticity is 100% verified prior to dispatch.'
              )
            }
          >
            <Text style={styles.menuTitle}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() =>
              handleOpenLegal(
                'Privacy Policy',
                'Krishna Accessories respects your confidentiality. Your biometric keys, payment tokens, and delivery locations are encrypted end-to-end with AES-256 standard.'
              )
            }
          >
            <Text style={styles.menuTitle}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuRow, { borderBottomWidth: 0 }]}
            onPress={() =>
              handleOpenLegal(
                'Return Policy',
                'We offer a 14-day complimentary white-glove inspection guarantee. Unaltered items with original seal and certificate of authenticity may be exchanged or returned.'
              )
            }
          >
            <Text style={styles.menuTitle}>White-Glove Return Guarantee</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Store Footer */}
        <Footer />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  content: {
    padding: 16,
    paddingBottom: 40
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16
  },
  sectionHeader: {
    color: Colors.accent,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '800',
    marginBottom: 12
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  settingTextGroup: {
    flex: 1,
    paddingRight: 12
  },
  settingTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600'
  },
  settingDesc: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  menuTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500'
  },
  menuValue: {
    color: Colors.textMuted,
    fontSize: 13
  },
  versionInfo: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    letterSpacing: 1.5,
    marginTop: 12
  }
});
