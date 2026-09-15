import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { EmptyState } from '../components/EmptyState';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2;

export const WishlistScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const items = wishlist?.items || [];

  return (
    <View style={styles.container}>
      <Header
        title="Saved Pieces"
        subtitle={items.length > 0 ? `${items.length} saved ${items.length === 1 ? 'item' : 'items'}` : undefined}
        showSearch
        showCategories
        showCart
        showAccount
      />

      {items.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="Your Wishlist is Empty"
          message="Save pieces that catch your eye to revisit and acquire later."
          actionText="Explore Boutique"
          onAction={() => navigation.navigate('HomeTab')}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => i.id}
          numColumns={2}
          contentContainerStyle={{ padding: 16 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          ListFooterComponent={<Footer />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate('ProductDetails', { productId: item.productId })}
              >
                <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} style={styles.img} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => toggleWishlist(item.productId)}
              >
                <Ionicons name="close" size={16} color="#FFF" />
              </TouchableOpacity>

              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>{item.productName}</Text>
                <Text style={styles.price}>₹{item.price.toLocaleString('en-IN')}</Text>

                <TouchableOpacity
                  style={styles.moveToBagBtn}
                  onPress={async () => {
                    await addToCart(item.productId, 1);
                    await toggleWishlist(item.productId);
                  }}
                >
                  <Text style={styles.moveToBagText}>Move to Bag</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 14,
    position: 'relative',
  },
  img: { width: '100%', height: CARD_WIDTH * 1.1 },
  deleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { padding: 10 },
  title: { fontSize: 12, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  price: { fontSize: 14, fontWeight: '700', color: Colors.goldLight, marginBottom: 8 },
  moveToBagBtn: {
    backgroundColor: Colors.goldPrimary,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  moveToBagText: { color: '#0A0A0D', fontSize: 11, fontWeight: '700' },
});
