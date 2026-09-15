import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { ProductCard } from '../components/ProductCard';
import { productService } from '../services/api/productService';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { EmptyState } from '../components/EmptyState';

export const SearchScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { addToCart } = useCart();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.trim().length >= 2) {
      setHasSearched(true);
      const res = await productService.getProducts({ search: text.trim(), pageSize: 30 });
      setResults(res.items);
    } else {
      setResults([]);
      setHasSearched(false);
    }
  };

  const trendingTags = ['Watches', 'Gold', 'Ray-Ban', 'Titan', 'Ceramic', 'Briefcase'];

  return (
    <View style={styles.container}>
      {/* Header Search Box */}
      <View style={styles.searchHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.inputWrapper}>
          <Ionicons name="search" size={18} color={Colors.goldPrimary} />
          <TextInput
            value={query}
            onChangeText={handleSearch}
            placeholder="Search luxury catalog..."
            placeholderTextColor={Colors.textDim}
            style={styles.searchInput}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Suggested Tags */}
      {!hasSearched && (
        <View style={styles.tagsContainer}>
          <Text style={styles.tagsTitle}>Popular Luxury Searches</Text>
          <View style={styles.tagsRow}>
            {trendingTags.map((t, idx) => (
              <TouchableOpacity key={idx} onPress={() => handleSearch(t)} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Results */}
      {hasSearched && results.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No Results Found"
          message={`No luxury items match "${query}". Try searching by brand, watch type or category.`}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 16 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
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
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  inputWrapper: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
  },
  tagsContainer: {
    padding: 20,
  },
  tagsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    color: Colors.goldLight,
    fontSize: 12,
    fontWeight: '600',
  },
});
