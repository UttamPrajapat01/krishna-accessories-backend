import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { addressService } from '../services/api/addressService';
import { Address } from '../types';

export const AddressScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Address Form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const list = await addressService.getAddresses();
      setAddresses(list);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim() || !phone.trim() || !line1.trim() || !city.trim() || !postalCode.trim()) {
      Alert.alert('Required Fields', 'Please fill in recipient name, phone, address, city, and postal code.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      setSaving(true);
      const newAddr = await addressService.create({
        fullName: fullName.trim(),
        phone: cleanPhone,
        addressLine1: line1.trim(),
        city: city.trim(),
        state: state.trim() || 'India',
        postalCode: postalCode.trim(),
        country: 'India',
        isDefault: addresses.length === 0,
      });

      setShowAddForm(false);
      setFullName('');
      setPhone('');
      setLine1('');
      setCity('');
      setState('');
      setPostalCode('');
      await fetchAddresses();

      Alert.alert('Address Saved', 'Your delivery address has been saved.', [
        {
          text: 'Use for Checkout',
          onPress: () => {
            if (navigation.canGoBack()) navigation.goBack();
          },
        },
        { text: 'Stay Here', style: 'cancel' },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not save address. Please check your details.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to remove this address?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          await addressService.delete(id);
          fetchAddresses();
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Shipping Addresses"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={() => setShowAddForm(!showAddForm)} style={{ padding: 4 }}>
            <Ionicons name={showAddForm ? 'close' : 'add'} size={24} color={Colors.goldLight} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {showAddForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add New Delivery Address</Text>
            <Input label="Recipient Full Name" value={fullName} onChangeText={setFullName} placeholder="Aarav Sharma" />
            <Input label="Phone Number" value={phone} onChangeText={setPhone} placeholder="9876543210" keyboardType="phone-pad" />
            <Input label="Address Line" value={line1} onChangeText={setLine1} placeholder="Flat, Suite, Street name" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Input label="City" value={city} onChangeText={setCity} placeholder="Mumbai" containerStyle={{ flex: 1 }} />
              <Input label="Postal Code" value={postalCode} onChangeText={setPostalCode} placeholder="400001" keyboardType="number-pad" containerStyle={{ flex: 1 }} />
            </View>
            <Input label="State" value={state} onChangeText={setState} placeholder="Maharashtra" />
            <Button title="Save Delivery Address" onPress={handleSave} loading={saving} style={{ marginTop: 6 }} />
          </View>
        )}

        {addresses.map(a => (
          <View key={a.id} style={[styles.addrCard, a.isDefault ? styles.defaultCard : null]}>
            <View style={styles.addrHeader}>
              <Text style={styles.addrName}>{a.fullName}</Text>
              {a.isDefault && <Text style={styles.defaultBadge}>DEFAULT</Text>}
            </View>
            <Text style={styles.addrText}>{a.addressLine1}</Text>
            <Text style={styles.addrText}>{a.city}, {a.state} - {a.postalCode}</Text>
            <Text style={styles.addrPhone}>Phone: {a.phone}</Text>

            <View style={styles.addrActions}>
              {!a.isDefault && (
                <TouchableOpacity onPress={async () => { await addressService.setDefault(a.id); fetchAddresses(); }}>
                  <Text style={styles.actionLink}>Set as Default</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => handleDelete(a.id)} style={{ marginLeft: 'auto' }}>
                <Ionicons name="trash-outline" size={16} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {addresses.length === 0 && !showAddForm && (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: Colors.textMuted, fontSize: 14 }}>No saved addresses found.</Text>
            <Button title="Add First Address" onPress={() => setShowAddForm(true)} style={{ marginTop: 14 }} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  formCard: { backgroundColor: Colors.card, padding: 18, borderRadius: 12, borderWidth: 1, borderColor: Colors.borderGold, marginBottom: 18 },
  formTitle: { fontSize: 15, fontWeight: '700', color: Colors.goldLight, marginBottom: 14 },
  addrCard: { backgroundColor: Colors.card, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  defaultCard: { borderColor: Colors.goldPrimary, backgroundColor: 'rgba(212, 175, 55, 0.05)' },
  addrHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  addrName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  defaultBadge: { fontSize: 10, fontWeight: '800', color: Colors.goldPrimary, letterSpacing: 1 },
  addrText: { fontSize: 13, color: Colors.textMuted, lineHeight: 18 },
  addrPhone: { fontSize: 12, color: Colors.textDim, marginTop: 6 },
  addrActions: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  actionLink: { color: Colors.goldLight, fontSize: 12, fontWeight: '600' },
});
