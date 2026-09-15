import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { productService } from '../services/api/productService';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { EmptyState } from '../components/EmptyState';
import { LoadingView } from '../components/LoadingView';

export const ProductListScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { title = 'Products', categoryId, brandId, isFeatured, isBestSeller } = route.params || {};
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchProducts();
  }, [sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getProducts({
        categoryId,
        brandId,
        isFeatured,
        isBestSeller,
        sortBy,
        pageSize: 50,
      });
      setProducts(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sortOptions = [
    { id: 'newest', label: 'Newest' },
    { id: 'price_asc', label: 'Price: Low-High' },
    { id: 'price_desc', label: 'Price: High-Low' },
    { id: 'popular', label: 'Popular' },
  ];

  return (
    <View style={styles.container}>
      <Header
        title={title}
        showBack
        onBack={() => navigation.goBack()}
        showSearch
        showCart
        showAccount
      />

      {/* Sort Strip */}
      <View style={styles.sortStrip}>
        {sortOptions.map(opt => (
          <TouchableOpacity
            key={opt.id}
            onPress={() => setSortBy(opt.id)}
            style={[styles.sortChip, sortBy === opt.id ? styles.activeSortChip : null]}
          >
            <Text style={[styles.sortText, sortBy === opt.id ? styles.activeSortText : null]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <LoadingView />
      ) : products.length === 0 ? (
        <EmptyState title="No Products" message="No luxury pieces currently match this filter criteria." />
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          ListFooterComponent={<Footer />}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
              onAddToCart={() => addToCart(item.id, 1)}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  sortStrip: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeSortChip: {
    borderColor: Colors.goldPrimary,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  sortText: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  activeSortText: { color: Colors.goldLight },
  list: { padding: 16 },
});
