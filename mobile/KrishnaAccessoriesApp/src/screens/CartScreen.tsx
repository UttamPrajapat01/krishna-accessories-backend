import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useCart } from '../context/CartContext';
import { EmptyState } from '../components/EmptyState';
import apiClient from '../services/api/apiClient';

export const CartScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  const items = cart?.items || [];

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      // Test mock coupons directly
      const code = couponCode.trim().toUpperCase();
      if (code === 'WELCOME10') {
        const d = Math.round((cart?.subTotal || 0) * 0.1);
        setDiscount(d);
        setCouponMessage('WELCOME10 applied! 10% privilege discount.');
      } else if (code === 'KRISHNA500') {
        setDiscount(500);
        setCouponMessage('KRISHNA500 applied! ₹500 discount.');
      } else {
        Alert.alert('Invalid Code', 'The promo code entered is invalid or expired.');
      }
    } catch {
      Alert.alert('Error', 'Could not apply coupon.');
    }
  };

  const finalTotal = Math.max(0, (cart?.totalAmount || 0) - discount);

  return (
    <View style={styles.container}>
      <Header
        title="Shopping Bag"
        subtitle={items.length > 0 ? `${items.length} unique ${items.length === 1 ? 'item' : 'items'}` : undefined}
        showSearch
        showCategories
        showAccount
      />

      {items.length === 0 ? (
        <EmptyState
          icon="bag-handle-outline"
          title="Your Bag is Empty"
          message="Browse our luxury collections and add your desired pieces."
          actionText="Discover Collection"
          onAction={() => navigation.navigate('HomeTab')}
        />
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            {/* Cart Items List */}
            {items.map(item => (
              <View key={item.id} style={styles.itemCard}>
                <Image
                  source={{ uri: item.productImageUrl || 'https://via.placeholder.com/80' }}
                  style={styles.itemImage}
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.productName}</Text>
                  <Text style={styles.itemSku}>SKU: {item.productSku}</Text>
                  <Text style={styles.itemPrice}>₹{item.unitPrice.toLocaleString('en-IN')}</Text>

                  <View style={styles.stepperRow}>
                    <View style={styles.stepper}>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                        style={styles.stepBtn}
                      >
                        <Ionicons name="remove" size={14} color="#FFF" />
                      </TouchableOpacity>
                      <Text style={styles.stepQty}>{item.quantity}</Text>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                        style={styles.stepBtn}
                      >
                        <Ionicons name="add" size={14} color="#FFF" />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeBtn}>
                      <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            {/* Promo Coupon Section */}
            <View style={styles.couponBox}>
              <Text style={styles.boxTitle}>Promotional Privilege</Text>
              <View style={styles.couponInputRow}>
                <Input
                  value={couponCode}
                  onChangeText={setCouponCode}
                  placeholder="e.g. WELCOME10"
                  autoCapitalize="characters"
                  containerStyle={{ flex: 1, marginBottom: 0 }}
                />
                <Button title="Apply" onPress={handleApplyCoupon} variant="outline" style={{ height: 48 }} />
              </View>
              {couponMessage && (
                <Text style={{ color: Colors.success, fontSize: 11, marginTop: 6 }}>{couponMessage}</Text>
              )}
            </View>

            {/* Order Bill Summary */}
            <View style={styles.summaryBox}>
              <Text style={styles.boxTitle}>Price Breakdown</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>₹{cart?.subTotal.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Estimated GST (18%)</Text>
                <Text style={styles.summaryValue}>₹{cart?.estimatedTax.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>White-Glove Shipping</Text>
                <Text style={[styles.summaryValue, { color: Colors.success }]}>
                  {cart?.estimatedShipping === 0 ? 'Complimentary' : `₹${cart?.estimatedShipping}`}
                </Text>
              </View>
              {discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: Colors.goldLight }]}>Privilege Discount</Text>
                  <Text style={[styles.summaryValue, { color: Colors.goldLight }]}>-₹{discount.toLocaleString('en-IN')}</Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Payable</Text>
                <Text style={styles.totalValue}>₹{finalTotal.toLocaleString('en-IN')}</Text>
              </View>
            </View>

            {/* Store Footer */}
            <Footer />
          </ScrollView>

          {/* Proceed Button */}
          <View style={styles.bottomBar}>
            <View>
              <Text style={{ fontSize: 11, color: Colors.textMuted }}>Total Amount</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.text }}>₹{finalTotal.toLocaleString('en-IN')}</Text>
            </View>
            <Button
              title="Proceed to Checkout"
              onPress={() => navigation.navigate('Checkout', { couponCode: discount > 0 ? couponCode : undefined })}
              style={{ minWidth: 180 }}
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 100 },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  itemImage: { width: 75, height: 75, borderRadius: 8, backgroundColor: '#111' },
  itemDetails: { flex: 1, justifyContent: 'space-between' },
  itemName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  itemSku: { fontSize: 11, color: Colors.textMuted },
  itemPrice: { fontSize: 14, fontWeight: '700', color: Colors.goldLight },
  stepperRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 6, borderWidth: 1, borderColor: Colors.border },
  stepBtn: { padding: 6, paddingHorizontal: 8 },
  stepQty: { fontSize: 12, fontWeight: '700', color: '#FFF', paddingHorizontal: 6 },
  removeBtn: { padding: 6 },
  couponBox: { backgroundColor: Colors.surface, padding: 14, borderRadius: 10, marginVertical: 10 },
  boxTitle: { fontSize: 12, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  couponInputRow: { flexDirection: 'row', gap: 8 },
  summaryBox: { backgroundColor: Colors.card, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginTop: 6 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  summaryLabel: { fontSize: 13, color: Colors.textMuted },
  summaryValue: { fontSize: 13, fontWeight: '600', color: Colors.text },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10, marginTop: 6 },
  totalLabel: { fontSize: 15, fontWeight: '700', color: Colors.text },
  totalValue: { fontSize: 17, fontWeight: '800', color: Colors.goldPrimary },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 74, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
});
