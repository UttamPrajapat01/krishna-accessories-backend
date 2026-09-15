import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import apiClient from '../services/api/apiClient';
import { Category } from '../types';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 44) / 2;

export const CategoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    apiClient.get('/categories').then(res => {
      if (res.data.success) setCategories(res.data.data);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Header
        title="All Collections"
        subtitle="Handcrafted Luxury Catalog"
        showBack={navigation.canGoBack()}
        showSearch
        showCart
        showAccount
      />
      <FlatList
        data={categories}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        ListFooterComponent={<Footer />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ProductList', { categoryId: item.id, title: item.name })}
          >
            <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/180' }} style={styles.img} />
            <View style={styles.overlay} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.count}>{item.productCount} Masterpieces</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 16, gap: 12 },
  card: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.3,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  img: { width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 13, 0.45)',
  },
  info: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
  },
  name: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  count: { fontSize: 11, color: Colors.goldLight, marginTop: 2 },
});
