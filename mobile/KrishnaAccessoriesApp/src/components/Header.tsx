import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
  onSearchPress?: () => void;
  showCategories?: boolean;
  onCategoriesPress?: () => void;
  showCart?: boolean;
  onCartPress?: () => void;
  showAccount?: boolean;
  onAccountPress?: () => void;
  rightAction?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showLogo = false,
  showBack = false,
  onBack,
  showSearch = true,
  onSearchPress,
  showCategories = false,
  onCategoriesPress,
  showCart = true,
  onCartPress,
  showAccount = false,
  onAccountPress,
  rightAction,
  rightElement,
}) => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { itemCount } = useCart();

  // Determine top padding for Android notches and status bars
  const topPadding = Platform.OS === 'android'
    ? Math.max(StatusBar.currentHeight || 0, insets.top)
    : insets.top;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleSearch = () => {
    if (onSearchPress) {
      onSearchPress();
    } else {
      navigation.navigate('Search');
    }
  };

  const handleCategories = () => {
    if (onCategoriesPress) {
      onCategoriesPress();
    } else {
      navigation.navigate('Category');
    }
  };

  const handleCart = () => {
    if (onCartPress) {
      onCartPress();
    } else {
      navigation.navigate('CartTab');
    }
  };

  const handleAccount = () => {
    if (onAccountPress) {
      onAccountPress();
    } else {
      navigation.navigate('ProfileTab');
    }
  };

  const handleLogoHomePress = () => {
    navigation.navigate('HomeTab');
  };

  return (
    <View style={[styles.wrapper, { paddingTop: topPadding }]}>
      <View style={styles.header}>
        {/* Left Section: Back button or Logo */}
        <View style={styles.left}>
          {showBack && (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.actionBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={22} color={Colors.text} />
            </TouchableOpacity>
          )}

          {showLogo ? (
            <TouchableOpacity
              onPress={handleLogoHomePress}
              style={styles.logoRow}
              activeOpacity={0.8}
            >
              <View style={styles.logoBadge}>
                <Image
                  source={require('../../assets/icon.png')}
                  style={styles.logoImg}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.brandTextBox}>
                <Text style={styles.brandTitle}>KRISHNA</Text>
                <Text style={styles.brandSubtitle}>ACCESSORIES</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.titleBox}>
              {title ? (
                <Text style={styles.title} numberOfLines={1}>
                  {title}
                </Text>
              ) : null}
              {subtitle ? (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
          )}
        </View>

        {/* Right Section: Action Icons */}
        <View style={styles.right}>
          {showCategories && (
            <TouchableOpacity
              onPress={handleCategories}
              style={styles.actionBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="grid-outline" size={20} color={Colors.text} />
            </TouchableOpacity>
          )}

          {showSearch && (
            <TouchableOpacity
              onPress={handleSearch}
              style={styles.actionBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="search-outline" size={21} color={Colors.text} />
            </TouchableOpacity>
          )}

          {showCart && (
            <TouchableOpacity
              onPress={handleCart}
              style={styles.actionBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="bag-handle-outline" size={21} color={Colors.goldLight} />
              {itemCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {itemCount > 99 ? '99+' : itemCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {showAccount && (
            <TouchableOpacity
              onPress={handleAccount}
              style={styles.actionBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="person-outline" size={20} color={Colors.text} />
            </TouchableOpacity>
          )}

          {rightAction || rightElement}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderGold,
    overflow: 'hidden',
  },
  logoImg: {
    width: 32,
    height: 32,
  },
  brandTextBox: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.goldLight,
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 8,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginTop: -2,
  },
  titleBox: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  badge: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: Colors.goldPrimary,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  badgeText: {
    color: '#0A0A0D',
    fontSize: 9,
    fontWeight: '900',
  },
});
