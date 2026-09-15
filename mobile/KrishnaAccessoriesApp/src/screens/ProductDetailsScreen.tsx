import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { productService } from '../services/api/productService';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import apiClient from '../services/api/apiClient';
import { LoadingView } from '../components/LoadingView';

const { width } = Dimensions.get('window');

export const ProductDetailsScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { productId } = route.params;
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const [pData, rRes] = await Promise.all([
        productService.getProductById(productId),
        apiClient.get(`/reviews/product/${productId}`),
      ]);
      setProduct(pData);
      if (rRes.data.success) setReviews(rRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      setAdding(true);
      await addToCart(product.id, 1);
      Alert.alert('Added to Bag', `${product.name} is reserved in your shopping bag.`);
    } catch (err: any) {
      Alert.alert('Notice', err.response?.data?.message || 'Could not add to cart.');
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    await addToCart(product.id, 1);
    navigation.navigate('CartTab');
  };

  if (loading || !product) {
    return <LoadingView message="Retrieving masterpiece..." />;
  }

  const wishlisted = isInWishlist(product.id);
  const images = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [product.mainImageUrl || 'https://via.placeholder.com/300'];

  return (
    <View style={styles.container}>
      <Header
        title={product.brandName}
        subtitle={product.name}
        showBack
        onBack={() => navigation.goBack()}
        showSearch
        showCart
        showAccount
        rightAction={
          <TouchableOpacity onPress={() => toggleWishlist(product.id)} style={{ padding: 6 }}>
            <Ionicons name={wishlisted ? 'heart' : 'heart-outline'} size={22} color={wishlisted ? Colors.goldPrimary : Colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Main Image Gallery */}
        <View style={styles.imageGallery}>
          <Image source={{ uri: images[selectedImgIndex] }} style={styles.mainImage} resizeMode="cover" />
          {images.length > 1 && (
            <View style={styles.thumbRow}>
              {images.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedImgIndex(idx)}
                  style={[styles.thumbBox, selectedImgIndex === idx ? styles.activeThumb : null]}
                >
                  <Image source={{ uri: img }} style={styles.thumbImg} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Product Details Header */}
        <View style={styles.detailsBox}>
          <Text style={styles.brandTitle}>{product.brandName}</Text>
          <Text style={styles.productTitle}>{product.name}</Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={Colors.goldPrimary} />
            <Text style={styles.ratingValue}>{product.averageRating > 0 ? product.averageRating : '4.9'}</Text>
            <Text style={styles.ratingCount}>({product.reviewCount || 1} verified client reviews)</Text>
            <Text style={styles.skuTag}>SKU: {product.sku}</Text>
          </View>

          {/* Pricing */}
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>₹{product.price.toLocaleString('en-IN')}</Text>
            {product.mrp > product.price && (
              <>
                <Text style={styles.mrpText}>₹{product.mrp.toLocaleString('en-IN')}</Text>
                <View style={styles.discountTag}>
                  <Text style={styles.discountTagText}>{product.discount}% OFF</Text>
                </View>
              </>
            )}
          </View>
          <Text style={styles.taxNote}>Inclusive of all luxury taxes & domestic courier fees</Text>

          {/* Availability Status */}
          <View style={styles.stockRow}>
            <Ionicons
              name={product.stockQuantity > 0 ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={product.stockQuantity > 0 ? Colors.success : Colors.danger}
            />
            <Text style={[styles.stockText, { color: product.stockQuantity > 0 ? Colors.success : Colors.danger }]}>
              {product.stockQuantity > 5
                ? 'In Stock & Ready to Dispatch'
                : product.stockQuantity > 0
                ? `Only ${product.stockQuantity} Pieces Remaining`
                : 'Currently Sold Out'}
            </Text>
          </View>

          {/* Description */}
          <View style={styles.descSection}>
            <Text style={styles.sectionHeading}>Product Overview</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>

          {/* Specs */}
          <View style={styles.specsSection}>
            <Text style={styles.sectionHeading}>Boutique Specifications</Text>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Category</Text>
              <Text style={styles.specVal}>{product.categoryName}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Brand Partner</Text>
              <Text style={styles.specVal}>{product.brandName}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Authenticity</Text>
              <Text style={styles.specVal}>100% Certified Luxury</Text>
            </View>
          </View>

          {/* Client Reviews Section */}
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionHeading}>Client Experiences</Text>
            {reviews.map(r => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{r.userName}</Text>
                  <Text style={styles.reviewRating}>{'★'.repeat(r.rating)}</Text>
                </View>
                <Text style={styles.reviewComment}>{r.comment}</Text>
              </View>
            ))}
            {reviews.length === 0 && (
              <Text style={{ color: Colors.textMuted, fontSize: 12 }}>No reviews posted yet.</Text>
            )}
          </View>
        </View>

        {/* Store Footer */}
        <Footer />
      </ScrollView>

      {/* Bottom Action Floating Bar */}
      <View style={styles.bottomBar}>
        <Button
          title="Add to Bag"
          onPress={handleAddToCart}
          variant="secondary"
          loading={adding}
          style={styles.actionBtn}
          icon={<Ionicons name="bag-outline" size={18} color="#FFF" />}
        />
        <Button
          title="Buy Now"
          onPress={handleBuyNow}
          variant="primary"
          style={styles.actionBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 100 },
  imageGallery: { width: '100%', height: width * 0.95, backgroundColor: '#111116', position: 'relative' },
  mainImage: { width: '100%', height: '100%' },
  thumbRow: { position: 'absolute', bottom: 12, left: 16, flexDirection: 'row', gap: 8 },
  thumbBox: { width: 44, height: 44, borderRadius: 6, borderWidth: 1, borderColor: '#444', overflow: 'hidden' },
  activeThumb: { borderColor: Colors.goldPrimary, borderWidth: 2 },
  thumbImg: { width: '100%', height: '100%' },
  detailsBox: { padding: 20 },
  brandTitle: { fontSize: 12, fontWeight: '800', color: Colors.goldLight, letterSpacing: 1.5, textTransform: 'uppercase' },
  productTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginTop: 4, marginBottom: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  ratingValue: { fontSize: 13, fontWeight: '700', color: Colors.text },
  ratingCount: { fontSize: 11, color: Colors.textMuted },
  skuTag: { fontSize: 11, color: Colors.textDim, marginLeft: 'auto' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  priceText: { fontSize: 24, fontWeight: '800', color: Colors.text },
  mrpText: { fontSize: 15, color: Colors.textDim, textDecorationLine: 'line-through' },
  discountTag: { backgroundColor: 'rgba(212, 175, 55, 0.2)', borderWidth: 1, borderColor: Colors.borderGold, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  discountTagText: { fontSize: 11, fontWeight: '700', color: Colors.goldLight },
  taxNote: { fontSize: 11, color: Colors.textMuted, marginTop: 4, marginBottom: 14 },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border, marginBottom: 18 },
  stockText: { fontSize: 12, fontWeight: '600' },
  descSection: { marginBottom: 20 },
  sectionHeading: { fontSize: 14, fontWeight: '700', color: Colors.text, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },
  descriptionText: { fontSize: 13, color: Colors.textMuted, lineHeight: 20 },
  specsSection: { marginBottom: 20, backgroundColor: Colors.surface, padding: 14, borderRadius: 10 },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  specKey: { fontSize: 12, color: Colors.textMuted },
  specVal: { fontSize: 12, fontWeight: '600', color: '#FFF' },
  reviewsSection: { marginTop: 10 },
  reviewCard: { backgroundColor: Colors.surface, padding: 12, borderRadius: 8, marginBottom: 10 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  reviewerName: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  reviewRating: { color: Colors.goldPrimary, fontSize: 12 },
  reviewComment: { fontSize: 12, color: Colors.textMuted },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 72, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  actionBtn: { flex: 1 },
});
