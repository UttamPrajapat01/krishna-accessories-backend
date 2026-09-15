import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you wish to sign out of your Krishna Accessories account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }]
            });
          }
        }
      ]
    );
  };

  const handleConciergeSupport = () => {
    Alert.alert(
      'Private Concierge',
      'Contact our master luxury advisors:\n\nDirect Hotline: +91 98765 43210\nConcierge Email: concierge@krishnaaccessories.com\n\nAvailable 24 hours daily.',
      [{ text: 'Close' }]
    );
  };

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <Header title="MY ACCOUNT" showSearch showCategories showCart />
        <ScrollView contentContainerStyle={styles.guestScroll}>
          <View style={styles.guestContent}>
            <View style={styles.guestAvatar}>
              <Ionicons name="person-outline" size={48} color={Colors.accent} />
            </View>
            <Text style={styles.guestTitle}>Welcome to Krishna Accessories</Text>
            <Text style={styles.guestSubtitle}>
              Sign in to track luxury orders, manage bespoke shipping addresses, and access your private wishlist.
            </Text>
            <Button
              title="SIGN IN"
              onPress={() => navigation.navigate('Login')}
              style={{ width: '100%', marginBottom: 12 }}
            />
            <Button
              title="CREATE AN ACCOUNT"
              variant="outline"
              onPress={() => navigation.navigate('Register')}
              style={{ width: '100%' }}
            />
          </View>
          <Footer />
        </ScrollView>
      </View>
    );
  }

  const initials = user.fullName
    ? user.fullName
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'KA';

  return (
    <View style={styles.container}>
      <Header title="MY ACCOUNT" showSearch showCategories showCart />

      <ScrollView contentContainerStyle={styles.content}>
        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.fullName}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.tierBadge}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.accent} />
              <Text style={styles.tierText}>PRIVILEGE PATRON</Text>
            </View>
          </View>
        </View>

        {/* Exclusive Benefits Banner */}
        <View style={styles.privilegeBanner}>
          <View style={styles.bannerHeader}>
            <Ionicons name="diamond" size={20} color={Colors.accent} />
            <Text style={styles.bannerTitle}>Krishna Privileged Club</Text>
          </View>
          <Text style={styles.bannerSubtitle}>
            Enjoy complimentary white-glove insured delivery, priority atelier dispatch, and bespoke personal styling.
          </Text>
        </View>

        {/* Navigation Sections */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>ORDERS & COMMERCE</Text>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('Orders')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="receipt-outline" size={20} color={Colors.accent} />
              <Text style={styles.menuText}>Order History</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('WishlistTab')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="heart-outline" size={20} color={Colors.accent} />
              <Text style={styles.menuText}>Saved Wishlist</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuRow, { borderBottomWidth: 0 }]}
            onPress={() => navigation.navigate('Address')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="location-outline" size={20} color={Colors.accent} />
              <Text style={styles.menuText}>Shipping Addresses</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>PREFERENCES & CONCIERGE</Text>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="notifications-outline" size={20} color={Colors.accent} />
              <Text style={styles.menuText}>Notifications & Updates</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="settings-outline" size={20} color={Colors.accent} />
              <Text style={styles.menuText}>Settings & Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuRow, { borderBottomWidth: 0 }]}
            onPress={handleConciergeSupport}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="chatbubbles-outline" size={20} color={Colors.accent} />
              <Text style={styles.menuText}>24/7 Luxury Concierge</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <Button
          title="SIGN OUT"
          variant="outline"
          onPress={handleLogout}
          style={styles.logoutBtn}
        />

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
  guestScroll: {
    flexGrow: 1,
  },
  guestContent: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  guestAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  guestTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center'
  },
  guestSubtitle: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
    paddingHorizontal: 12
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    marginBottom: 16,
    gap: 16
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: '800'
  },
  userInfo: {
    flex: 1
  },
  userName: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '700'
  },
  userEmail: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 2
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6
  },
  tierText: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5
  },
  privilegeBanner: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    padding: 16,
    marginBottom: 20
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  bannerTitle: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  bannerSubtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16
  },
  sectionHeader: {
    color: Colors.accent,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 8
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  menuText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500'
  },
  logoutBtn: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
    marginVertical: 12
  },
  versionText: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    letterSpacing: 1.5,
    marginTop: 10
  }
});
