import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Product } from '../types';
import { useWishlist } from '../context/WishlistContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2;

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onAddToCart?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, onAddToCart }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={styles.card}>
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.mainImageUrl || 'https://via.placeholder.com/200' }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Discount Tag */}
        {product.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{product.discount}% OFF</Text>
          </View>
        )}

        {/* Wishlist Button */}
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={() => toggleWishlist(product.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={wishlisted ? 'heart' : 'heart-outline'}
            size={18}
            color={wishlisted ? Colors.goldPrimary : '#FFF'}
          />
        </TouchableOpacity>
      </View>

      {/* Info Container */}
      <View style={styles.infoContainer}>
        <Text style={styles.brandText} numberOfLines={1}>{product.brandName}</Text>
        <Text style={styles.titleText} numberOfLines={1}>{product.name}</Text>

        {/* Price Row */}
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>₹{product.price.toLocaleString('en-IN')}</Text>
          {product.mrp > product.price && (
            <Text style={styles.mrpText}>₹{product.mrp.toLocaleString('en-IN')}</Text>
          )}
        </View>

        {/* Rating & Stock */}
        <View style={styles.footerRow}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={Colors.goldPrimary} />
            <Text style={styles.ratingText}>{product.averageRating > 0 ? product.averageRating : '4.8'}</Text>
          </View>

          {onAddToCart && (
            <TouchableOpacity
              style={styles.addCartBtn}
              onPress={onAddToCart}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={16} color="#0A0A0D" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 14,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.15,
    backgroundColor: '#0F0F13',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.95)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountText: {
    color: '#0A0A0D',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(10, 10, 13, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    padding: 10,
  },
  brandText: {
    color: Colors.goldLight,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: 2,
  },
  titleText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 6,
  },
  priceText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  mrpText: {
    color: Colors.textDim,
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  addCartBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.goldPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
