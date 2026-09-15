import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useCart } from '../context/CartContext';

export const Footer: React.FC = () => {
  const navigation = useNavigation<any>();
  const { itemCount } = useCart();

  const handleCall = () => {
    Linking.openURL('tel:+919876543210').catch(() => {
      Alert.alert('Private Concierge Hotline', '+91 98765 43210\nAvailable 24 Hours Daily.');
    });
  };

  const handleEmail = () => {
    Linking.openURL('mailto:concierge@krishnaaccessories.com').catch(() => {
      Alert.alert('Private Concierge Email', 'concierge@krishnaaccessories.com\nAvailable 24 Hours Daily.');
    });
  };

  return (
    <View style={styles.footerContainer}>
      {/* Brand Monogram & Tagline */}
      <View style={styles.brandSection}>
        <View style={styles.logoBadge}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logoImg}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.brandTitle}>KRISHNA ACCESSORIES</Text>
        <Text style={styles.brandTagline}>Haute Joaillerie & Royal Accoutrements</Text>
        <View style={styles.goldDivider} />
      </View>

      {/* Trust & Authenticity Badges */}
      <View style={styles.trustGrid}>
        <View style={styles.trustItem}>
          <Ionicons name="shield-checkmark" size={18} color={Colors.goldPrimary} />
          <Text style={styles.trustTitle}>100% Authentic</Text>
          <Text style={styles.trustSubtitle}>Certified Masterpieces</Text>
        </View>
        <View style={styles.trustItem}>
          <Ionicons name="airplane" size={18} color={Colors.goldPrimary} />
          <Text style={styles.trustTitle}>Insured Shipping</Text>
          <Text style={styles.trustSubtitle}>Pan-India White-Glove</Text>
        </View>
        <View style={styles.trustItem}>
          <Ionicons name="gift" size={18} color={Colors.goldPrimary} />
          <Text style={styles.trustTitle}>Royal Packaging</Text>
          <Text style={styles.trustSubtitle}>Signature Gift Boxes</Text>
        </View>
      </View>

      {/* Quick Navigation Links */}
      <View style={styles.navSection}>
        <Text style={styles.navSectionTitle}>BOUTIQUE NAVIGATION</Text>
        <View style={styles.navGrid}>
          <TouchableOpacity
            style={styles.navLink}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('HomeTab')}
          >
            <Ionicons name="home-outline" size={15} color={Colors.goldLight} />
            <Text style={styles.navLinkText}>Explore Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navLink}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Category')}
          >
            <Ionicons name="grid-outline" size={15} color={Colors.goldLight} />
            <Text style={styles.navLinkText}>Collections</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navLink}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('CartTab')}
          >
            <Ionicons name="bag-handle-outline" size={15} color={Colors.goldLight} />
            <Text style={styles.navLinkText}>
              Shopping Bag {itemCount > 0 ? `(${itemCount})` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navLink}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('WishlistTab')}
          >
            <Ionicons name="heart-outline" size={15} color={Colors.goldLight} />
            <Text style={styles.navLinkText}>Saved Pieces</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navLink}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ProfileTab')}
          >
            <Ionicons name="person-outline" size={15} color={Colors.goldLight} />
            <Text style={styles.navLinkText}>My Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navLink}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Search')}
          >
            <Ionicons name="search-outline" size={15} color={Colors.goldLight} />
            <Text style={styles.navLinkText}>Search Catalog</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Concierge & Support Box */}
      <View style={styles.conciergeBox}>
        <View style={styles.conciergeHeader}>
          <Ionicons name="headset-outline" size={18} color={Colors.goldPrimary} />
          <Text style={styles.conciergeTitle}>PRIVATE CLIENT CONCIERGE</Text>
        </View>
        <Text style={styles.conciergeSubtitle}>
          Personal advisors available 24 hours daily for bespoke orders and care.
        </Text>
        <View style={styles.conciergeBtnRow}>
          <TouchableOpacity style={styles.contactBtn} activeOpacity={0.8} onPress={handleCall}>
            <Ionicons name="call-outline" size={14} color="#0A0A0D" />
            <Text style={styles.contactBtnText}>Call Concierge</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactBtnOutline} activeOpacity={0.8} onPress={handleEmail}>
            <Ionicons name="mail-outline" size={14} color={Colors.goldLight} />
            <Text style={styles.contactBtnOutlineText}>Send Email</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Copyright & Legal */}
      <View style={styles.bottomBar}>
        <Text style={styles.copyrightText}>
          © 2026 Krishna Accessories Luxury Boutiques.
        </Text>
        <Text style={styles.versionText}>All rights reserved • v1.0.3</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: '#0F0F14',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 20,
    marginTop: 24,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.goldPrimary,
    marginBottom: 10,
    overflow: 'hidden',
  },
  logoImg: {
    width: 40,
    height: 40,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.goldLight,
    letterSpacing: 2.5,
  },
  brandTagline: {
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 1,
    marginTop: 3,
  },
  goldDivider: {
    width: 60,
    height: 2,
    backgroundColor: Colors.goldPrimary,
    marginTop: 12,
    borderRadius: 1,
  },
  trustGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(212, 175, 55, 0.04)',
    borderColor: Colors.borderGold,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  trustItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  trustTitle: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  trustSubtitle: {
    color: Colors.textDim,
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
  navSection: {
    marginBottom: 24,
  },
  navSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 14,
    textAlign: 'center',
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  navLink: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  navLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  conciergeBox: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  conciergeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  conciergeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.goldLight,
    letterSpacing: 1,
  },
  conciergeSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
    marginBottom: 14,
  },
  conciergeBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.goldPrimary,
    paddingVertical: 9,
    borderRadius: 8,
  },
  contactBtnText: {
    color: '#0A0A0D',
    fontSize: 11,
    fontWeight: '700',
  },
  contactBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    paddingVertical: 9,
    borderRadius: 8,
  },
  contactBtnOutlineText: {
    color: Colors.goldLight,
    fontSize: 11,
    fontWeight: '600',
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 16,
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 11,
    color: Colors.textDim,
    textAlign: 'center',
  },
  versionText: {
    fontSize: 10,
    color: Colors.textDim,
    marginTop: 4,
  },
});
