import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Button } from '../components/Button';

export const OrderSuccessScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { orderId, orderNumber, amount } = route.params || {};

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.outerRing}>
            <View style={styles.innerRing}>
              <Ionicons name="checkmark" size={48} color={Colors.primary} />
            </View>
          </View>
        </View>

        <Text style={styles.kicker}>CONCIERGE CONFIRMATION</Text>
        <Text style={styles.title}>Order Confirmed</Text>
        <Text style={styles.subtitle}>
          Thank you for choosing Krishna Accessories. Your bespoke luxury order has been received and assigned to our master curators.
        </Text>

        <View style={styles.receiptCard}>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Order Number</Text>
            <Text style={styles.receiptValue}>{orderNumber || 'KA-ORDER'}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Total Amount</Text>
            <Text style={styles.amountValue}>₹{(amount || 0).toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Estimated Dispatch</Text>
            <Text style={styles.dispatchValue}>2 - 3 Business Days</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Fulfillment</Text>
            <Text style={styles.receiptValue}>White-Glove Insured Courier</Text>
          </View>
        </View>

        <View style={styles.notificationNotice}>
          <Ionicons name="notifications-outline" size={20} color={Colors.accent} />
          <Text style={styles.noticeText}>
            A confirmation receipt and real-time tracking credentials have been sent to your notifications feed.
          </Text>
        </View>

        <View style={styles.actionButtons}>
          {orderId && (
            <Button
              title="TRACK ORDER DETAILS"
              onPress={() => navigation.replace('OrderDetails', { orderId })}
              style={{ marginBottom: 12 }}
            />
          )}

          <Button
            title="VIEW ALL ORDERS"
            variant="outline"
            onPress={() => navigation.replace('Orders')}
            style={{ marginBottom: 12 }}
          />

          <Button
            title="CONTINUE SHOPPING"
            variant="ghost"
            onPress={() => navigation.navigate('HomeTab')}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  content: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%'
  },
  iconContainer: {
    marginVertical: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  outerRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  innerRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8
  },
  kicker: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginBottom: 6
  },
  title: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 12
  },
  receiptCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    marginBottom: 20
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  receiptLabel: {
    color: Colors.textMuted,
    fontSize: 13
  },
  receiptValue: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600'
  },
  amountValue: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '800'
  },
  dispatchValue: {
    color: Colors.success,
    fontSize: 13,
    fontWeight: '600'
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10
  },
  notificationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 28,
    width: '100%'
  },
  noticeText: {
    color: Colors.textMuted,
    fontSize: 12,
    flex: 1,
    lineHeight: 18
  },
  actionButtons: {
    width: '100%'
  }
});
