import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { productService } from '../services/api/productService';
import { Category, Product } from '../types';
import apiClient from '../services/api/apiClient';
import { useCart } from '../context/CartContext';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { addToCart, itemCount } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const [cRes, fRes, bRes] = await Promise.all([
        apiClient.get('/categories'),
        productService.getFeatured(8),
        productService.getBestSellers(8),
      ]);
      if (cRes.data.success) setCategories(cRes.data.data);
      setFeatured(fRes);
      setBestSellers(bRes);
    } catch (err) {
      console.error('Home load error', err);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHomeData();
  };

  return (
    <View style={styles.container}>
      {/* Luxury Brand Header */}
      <Header
        showLogo
        showSearch
        showCategories
        showCart
        showAccount
      />

      <ScrollView
        style={styles.scrollArea}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.goldPrimary} />}
      >
        <View style={{ height: 14 }} />

        {/* Search Bar Trigger */}
      <TouchableOpacity
        style={styles.searchBar}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Search')}
      >
        <Ionicons name="search" size={18} color={Colors.goldPrimary} />
        <Text style={styles.searchPlaceholder}>Search luxury watches, bags, jewellery...</Text>
      </TouchableOpacity>

      {/* Categories Horizontal Strip */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Curated Collections</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CategoryTab')}>
          <Text style={styles.seeAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.categoryItem}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ProductList', { categoryId: cat.id, title: cat.name })}
          >
            <View style={styles.categoryImageWrap}>
              <Image source={{ uri: cat.imageUrl || 'https://via.placeholder.com/60' }} style={styles.catImg} />
            </View>
            <Text style={styles.catName} numberOfLines={1}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* VIP Promotional Hero Card */}
      <View style={styles.promoBanner}>
        <View style={styles.promoContent}>
          <Text style={styles.promoSub}>EXCLUSIVE PRIVATE COLLECTION</Text>
          <Text style={styles.promoTitle}>Swiss Haute Horlogerie</Text>
          <Text style={styles.promoDesc}>Use code WELCOME10 for 10% complimentary privilege.</Text>
          <TouchableOpacity
            style={styles.promoBtn}
            onPress={() => navigation.navigate('ProductList', { isFeatured: true, title: 'Featured Collection' })}
          >
            <Text style={styles.promoBtnText}>Discover Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Featured Products */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Masterpieces</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ProductList', { isFeatured: true, title: 'Featured' })}>
          <Text style={styles.seeAllText}>See More</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.productGrid}>
        {featured.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
            onAddToCart={() => addToCart(product.id, 1)}
          />
        ))}
      </View>

      {/* Best Sellers */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Connoisseur Best Sellers</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ProductList', { isBestSeller: true, title: 'Best Sellers' })}>
          <Text style={styles.seeAllText}>See More</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.productGrid}>
        {bestSellers.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
            onAddToCart={() => addToCart(product.id, 1)}
          />
        ))}
      </View>

      {/* Luxury Store Footer */}
      <Footer />
    </ScrollView>
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollArea: {
    flex: 1,
  },
  brandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.goldLight,
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 9,
    color: Colors.textMuted,
    letterSpacing: 3,
    fontWeight: '700',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 6,
    position: 'relative',
  },
  badgeCircle: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.goldPrimary,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#0A0A0D',
    fontSize: 9,
    fontWeight: '900',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 10,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    height: 44,
    gap: 10,
    marginBottom: 18,
  },
  searchPlaceholder: {
    color: Colors.textDim,
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 0.5,
  },
  seeAllText: {
    color: Colors.goldLight,
    fontSize: 12,
    fontWeight: '600',
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 8,
  },
  categoryItem: {
    alignItems: 'center',
    width: 68,
  },
  categoryImageWrap: {
    width: 62,
    height: 62,
    borderRadius: 31,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.borderGold,
    backgroundColor: Colors.surface,
    marginBottom: 6,
  },
  catImg: {
    width: '100%',
    height: '100%',
  },
  catName: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  promoBanner: {
    marginHorizontal: 16,
    marginVertical: 18,
    borderRadius: 14,
    backgroundColor: '#16161F',
    borderWidth: 1,
    borderColor: Colors.borderGold,
    padding: 20,
  },
  promoContent: {
    gap: 6,
  },
  promoSub: {
    color: Colors.goldPrimary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  promoTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  promoDesc: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
  },
  promoBtn: {
    backgroundColor: Colors.goldPrimary,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  promoBtnText: {
    color: '#0A0A0D',
    fontSize: 12,
    fontWeight: '700',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
});
