import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { addressService } from '../services/api/addressService';
import { orderService } from '../services/api/orderService';
import { paymentService } from '../services/api/paymentService';
import { Address } from '../types';

export const CheckoutScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { couponCode } = route.params || {};
  const { user } = useAuth();
  const { cart, refreshCart } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'CashOnDelivery'>('Razorpay');
  const [submitting, setSubmitting] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Inline Address Form State for New Users
  const [showAddForm, setShowAddForm] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [postalCode, setPostalCode] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  // Automatically refresh addresses whenever CheckoutScreen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadCheckoutData();
    }, [])
  );

  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.fullName || '');
      if (!phone && user.phoneNumber) setPhone(user.phoneNumber);
    }
  }, [user]);

  const loadCheckoutData = async () => {
    try {
      setLoadingAddresses(true);
      const list = await addressService.getAddresses();
      setAddresses(list);

      if (list && list.length > 0) {
        // Auto-select default address, or the previously selected one, or the first one
        setSelectedAddressId(prev => {
          if (prev && list.some(a => a.id === prev)) return prev;
          const def = list.find(a => a.isDefault) || list[0];
          return def ? def.id : '';
        });
        setShowAddForm(false);
      } else {
        // No addresses on file: automatically display the add address form
        setShowAddForm(true);
      }
    } catch (err) {
      console.error('Failed to load checkout addresses', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleSaveInlineAddress = async () => {
    if (!fullName.trim() || !phone.trim() || !addressLine1.trim() || !city.trim() || !postalCode.trim()) {
      Alert.alert('Required Details', 'Please fill in recipient name, phone number, address, city, and postal code.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      Alert.alert('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      setSavingAddress(true);
      const created = await addressService.create({
        fullName: fullName.trim(),
        phone: cleanPhone,
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        state: state.trim() || 'India',
        postalCode: postalCode.trim(),
        country: 'India',
        isDefault: addresses.length === 0,
      });

      const updatedList = await addressService.getAddresses();
      setAddresses(updatedList);
      setSelectedAddressId(created.id);
      setShowAddForm(false);
      Alert.alert('Delivery Address Saved', 'Your address has been saved and selected for this order.');
    } catch (err: any) {
      Alert.alert('Address Error', err.response?.data?.message || 'Could not save address. Please verify your details.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    // If the form is open and has details entered, prompt or save first
    if (!selectedAddressId) {
      if (showAddForm && addressLine1.trim()) {
        Alert.alert('Save Address First', 'Please tap "Save & Deliver Here" to confirm your address before placing the order.');
        return;
      }
      Alert.alert('Address Required', 'Please provide or select a shipping destination.');
      return;
    }

    try {
      setSubmitting(true);
      const order = await orderService.createOrder(selectedAddressId, paymentMethod, 'White glove delivery', couponCode);
      await refreshCart();

      if (paymentMethod === 'Razorpay') {
        navigation.navigate('Payment', { orderId: order.id, orderNumber: order.orderNumber, amount: order.totalAmount });
      } else {
        navigation.replace('OrderSuccess', { orderId: order.id, orderNumber: order.orderNumber, amount: order.totalAmount });
      }
    } catch (err: any) {
      Alert.alert('Checkout Error', err.response?.data?.message || 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Luxury Checkout"
        showBack
        onBack={() => navigation.goBack()}
        showSearch={false}
        showCart={false}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Shipping Destination */}
        <View style={styles.section}>
          <View style={styles.secHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="location" size={16} color={Colors.goldPrimary} />
              <Text style={styles.secTitle}>1. Delivery Destination</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Address')}>
              <Text style={styles.editLink}>Manage All</Text>
            </TouchableOpacity>
          </View>

          {loadingAddresses ? (
            <ActivityIndicator size="small" color={Colors.goldPrimary} style={{ marginVertical: 12 }} />
          ) : addresses.length > 0 && !showAddForm ? (
            <>
              {addresses.map(a => (
                <TouchableOpacity
                  key={a.id}
                  style={[styles.addressItem, selectedAddressId === a.id ? styles.activeAddress : null]}
                  onPress={() => setSelectedAddressId(a.id)}
                >
                  <Ionicons
                    name={selectedAddressId === a.id ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={selectedAddressId === a.id ? Colors.goldPrimary : Colors.textMuted}
                  />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={styles.addrName}>{a.fullName}</Text>
                      {a.isDefault && <Text style={styles.defaultBadge}>DEFAULT</Text>}
                    </View>
                    <Text style={styles.addrDetail}>{a.addressLine1}</Text>
                    <Text style={styles.addrDetail}>
                      {a.city}, {a.state} - {a.postalCode}
                    </Text>
                    <Text style={styles.addrPhone}>📞 {a.phone}</Text>
                  </View>
                  {selectedAddressId === a.id && (
                    <Ionicons name="checkmark-circle" size={18} color={Colors.goldPrimary} />
                  )}
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.addAnotherBtn} onPress={() => setShowAddForm(true)}>
                <Ionicons name="add-circle-outline" size={16} color={Colors.goldLight} />
                <Text style={styles.addAnotherText}>Add Another Delivery Address</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* Inline Address Form for New Users or Adding New */
            <View style={styles.inlineForm}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>
                  {addresses.length === 0 ? 'Enter Your Delivery Address' : 'New Delivery Address'}
                </Text>
                {addresses.length > 0 && (
                  <TouchableOpacity onPress={() => setShowAddForm(false)}>
                    <Ionicons name="close-circle-outline" size={20} color={Colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              <Input
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                placeholder="e.g. Aarav Sharma"
                leftIcon={<Ionicons name="person-outline" size={16} color={Colors.goldPrimary} />}
              />

              <Input
                label="Mobile Phone Number"
                value={phone}
                onChangeText={setPhone}
                placeholder="10-digit mobile number"
                keyboardType="phone-pad"
                leftIcon={<Ionicons name="call-outline" size={16} color={Colors.goldPrimary} />}
              />

              <Input
                label="Street Address / House / Flat"
                value={addressLine1}
                onChangeText={setAddressLine1}
                placeholder="Penthouse 14, Royal Palms Residency"
                leftIcon={<Ionicons name="home-outline" size={16} color={Colors.goldPrimary} />}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Input
                  label="City"
                  value={city}
                  onChangeText={setCity}
                  placeholder="Mumbai"
                  containerStyle={{ flex: 1 }}
                />
                <Input
                  label="PIN Code"
                  value={postalCode}
                  onChangeText={setPostalCode}
                  placeholder="400001"
                  keyboardType="number-pad"
                  containerStyle={{ flex: 1 }}
                />
              </View>

              <Input
                label="State"
                value={state}
                onChangeText={setState}
                placeholder="Maharashtra"
              />

              <Button
                title="Save & Deliver Here"
                onPress={handleSaveInlineAddress}
                loading={savingAddress}
                style={{ marginTop: 8 }}
              />
            </View>
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Ionicons name="card" size={16} color={Colors.goldPrimary} />
            <Text style={styles.secTitle}>2. Payment Method</Text>
          </View>

          <TouchableOpacity
            style={[styles.payOption, paymentMethod === 'Razorpay' ? styles.activePay : null]}
            onPress={() => setPaymentMethod('Razorpay')}
          >
            <Ionicons
              name={paymentMethod === 'Razorpay' ? 'radio-button-on' : 'radio-button-off'}
              size={18}
              color={paymentMethod === 'Razorpay' ? Colors.goldPrimary : Colors.textMuted}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.payName}>Razorpay Secure Online</Text>
              <Text style={styles.payDesc}>Credit/Debit Cards, UPI, NetBanking, Luxury EMI</Text>
            </View>
            <Ionicons name="shield-checkmark" size={20} color={Colors.goldPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.payOption, paymentMethod === 'CashOnDelivery' ? styles.activePay : null]}
            onPress={() => setPaymentMethod('CashOnDelivery')}
          >
            <Ionicons
              name={paymentMethod === 'CashOnDelivery' ? 'radio-button-on' : 'radio-button-off'}
              size={18}
              color={paymentMethod === 'CashOnDelivery' ? Colors.goldPrimary : Colors.textMuted}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.payName}>Cash on Delivery (COD)</Text>
              <Text style={styles.payDesc}>Pay in cash upon inspection at your doorstep</Text>
            </View>
            <Ionicons name="cash-outline" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Order Review Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.secTitle}>Order Breakdown</Text>
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>Items Total ({cart?.itemCount || 0})</Text>
            <Text style={styles.sumVal}>₹{cart?.subTotal.toLocaleString('en-IN') || 0}</Text>
          </View>
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>White-Glove Shipping</Text>
            <Text style={[styles.sumVal, { color: Colors.success }]}>Complimentary</Text>
          </View>
          <View
            style={[
              styles.sumRow,
              { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10, marginTop: 6 },
            ]}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFF' }}>Grand Total</Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.goldPrimary }}>
              ₹{cart?.totalAmount.toLocaleString('en-IN') || 0}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          title={paymentMethod === 'Razorpay' ? 'Proceed to Razorpay' : 'Confirm Order via COD'}
          onPress={handlePlaceOrder}
          loading={submitting}
          style={{ width: '100%' }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 110 },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
  },
  secHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  secTitle: { fontSize: 13, fontWeight: '700', color: Colors.text, textTransform: 'uppercase', letterSpacing: 0.5 },
  editLink: { color: Colors.goldLight, fontSize: 12, fontWeight: '600' },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  activeAddress: { borderColor: Colors.goldPrimary, backgroundColor: 'rgba(212, 175, 55, 0.08)' },
  addrName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  defaultBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.goldPrimary,
    borderWidth: 1,
    borderColor: Colors.goldPrimary,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    letterSpacing: 0.5,
  },
  addrDetail: { fontSize: 12, color: Colors.textMuted, marginTop: 2, lineHeight: 17 },
  addrPhone: { fontSize: 11, color: Colors.textDim, marginTop: 4 },
  addAnotherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 4,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.borderGold,
    borderRadius: 8,
  },
  addAnotherText: { color: Colors.goldLight, fontSize: 12, fontWeight: '600' },
  inlineForm: {
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  formTitle: { fontSize: 13, fontWeight: '700', color: Colors.goldLight },
  payOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  activePay: { borderColor: Colors.goldPrimary, backgroundColor: 'rgba(212, 175, 55, 0.08)' },
  payName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  payDesc: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  summaryCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  sumLabel: { fontSize: 13, color: Colors.textMuted },
  sumVal: { fontSize: 13, fontWeight: '600', color: '#FFF' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
