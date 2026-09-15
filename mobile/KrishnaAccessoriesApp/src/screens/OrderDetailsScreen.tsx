import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { LoadingView } from '../components/LoadingView';
import { ErrorView } from '../components/ErrorView';
import { orderService } from '../services/api/orderService';
import { Order, OrderItem } from '../types';

export const OrderDetailsScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { orderId } = route.params || {};
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderService.getOrderById(orderId);
      setOrder(res);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Unable to retrieve order details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you wish to cancel this bespoke order? This action cannot be reversed.',
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              await orderService.cancelOrder(orderId);
              Alert.alert('Order Cancelled', 'Your order has been cancelled.');
              fetchOrderDetails();
            } catch (err: any) {
              Alert.alert('Cancellation Failed', err.response?.data?.message || 'Could not cancel order.');
            } finally {
              setCancelling(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="ORDER DETAILS" showBack onBack={() => navigation.goBack()} />
        <LoadingView message="Loading bespoke order specifications..." />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.container}>
        <Header title="ORDER DETAILS" showBack onBack={() => navigation.goBack()} />
        <ErrorView message={error || 'Order record not found.'} onRetry={fetchOrderDetails} />
      </View>
    );
  }

  const isCancellable = ['pending', 'confirmed'].includes(order.orderStatus.toLowerCase());

  // Timeline computation
  const statusSteps = ['Placed', 'Confirmed', 'Shipped', 'Delivered'];
  const getStepIndex = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 0;
      case 'confirmed':
      case 'processing':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      default:
        return -1;
    }
  };

  const currentStep = getStepIndex(order.orderStatus);
  const isCancelled = order.orderStatus.toLowerCase() === 'cancelled';

  let parsedAddress: any = null;
  try {
    parsedAddress = JSON.parse(order.shippingAddressSnapshot);
  } catch {
    parsedAddress = null;
  }

  return (
    <View style={styles.container}>
      <Header
        title="ORDER DETAILS"
        subtitle={`Order #${order.orderNumber}`}
        showBack
        onBack={() => navigation.goBack()}
        showSearch
        showCart
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Order Info Header */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.label}>ORDER NUMBER</Text>
              <Text style={styles.orderNumber}>{order.orderNumber}</Text>
              <Text style={styles.dateText}>
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
            <Badge
              text={order.orderStatus.toUpperCase()}
              variant={
                order.orderStatus.toLowerCase() === 'delivered'
                  ? 'success'
                  : order.orderStatus.toLowerCase() === 'cancelled'
                  ? 'error'
                  : 'gold'
              }
            />
          </View>
        </View>

        {/* Timeline Tracker */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>FULFILLMENT STATUS</Text>
          {isCancelled ? (
            <View style={styles.cancelledBanner}>
              <Ionicons name="close-circle" size={24} color={Colors.error} />
              <Text style={styles.cancelledText}>This luxury order has been cancelled.</Text>
            </View>
          ) : (
            <View style={styles.timelineRow}>
              {statusSteps.map((step, idx) => {
                const isPassed = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <View key={step} style={styles.timelineStep}>
                    <View
                      style={[
                        styles.stepDot,
                        isPassed && styles.stepDotActive,
                        isCurrent && styles.stepDotCurrent
                      ]}
                    >
                      {isPassed ? (
                        <Ionicons name="checkmark" size={14} color={Colors.primary} />
                      ) : (
                        <View style={styles.stepDotInner} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        isPassed && styles.stepLabelActive,
                        isCurrent && styles.stepLabelCurrent
                      ]}
                    >
                      {step}
                    </Text>
                    {idx < statusSteps.length - 1 && (
                      <View
                        style={[
                          styles.timelineConnector,
                          idx < currentStep && styles.connectorActive
                        ]}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {order.trackingNumber ? (
            <View style={styles.trackingBox}>
              <Ionicons name="airplane-outline" size={20} color={Colors.accent} />
              <View style={{ flex: 1 }}>
                <Text style={styles.trackingTitle}>Tracking Identifier</Text>
                <Text style={styles.trackingCode}>{order.trackingNumber}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Items List */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>ACQUIRED PIECES ({order.items?.length || 0})</Text>
          {order.items?.map((item: OrderItem) => (
            <View key={item.id} style={styles.itemRow}>
              {item.productImageUrl ? (
                <Image source={{ uri: item.productImageUrl }} style={styles.itemImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="diamond-outline" size={22} color={Colors.accent} />
                </View>
              )}

              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
                <Text style={styles.itemSku}>SKU: {item.productSku}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                  <Text style={styles.itemPrice}>₹{item.totalPrice.toLocaleString('en-IN')}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Shipping Address */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>SHIPPING DESTINATION</Text>
          {parsedAddress ? (
            <View style={styles.addressBox}>
              <Text style={styles.addressName}>{parsedAddress.fullName}</Text>
              <Text style={styles.addressLine}>{parsedAddress.addressLine1}</Text>
              {parsedAddress.addressLine2 ? (
                <Text style={styles.addressLine}>{parsedAddress.addressLine2}</Text>
              ) : null}
              <Text style={styles.addressLine}>
                {parsedAddress.city}, {parsedAddress.state} - {parsedAddress.postalCode}
              </Text>
              <Text style={styles.addressLine}>{parsedAddress.country}</Text>
              <Text style={styles.addressPhone}>Phone: {parsedAddress.phone}</Text>
            </View>
          ) : (
            <Text style={styles.addressLine}>{order.shippingAddressSnapshot}</Text>
          )}
        </View>

        {/* Payment & Charges */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>PAYMENT & CHARGES</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Payment Mode</Text>
            <Text style={styles.metaValue}>{order.paymentMethod}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Payment Status</Text>
            <Text style={styles.metaValue}>{order.paymentStatus}</Text>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Subtotal</Text>
            <Text style={styles.metaValue}>₹{order.subTotal.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Tax (GST 18%)</Text>
            <Text style={styles.metaValue}>₹{order.taxAmount.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>White-Glove Shipping</Text>
            <Text style={styles.metaValue}>
              {order.shippingAmount === 0 ? 'Complimentary' : `₹${order.shippingAmount}`}
            </Text>
          </View>
          {order.discountAmount > 0 && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Privilege Discount</Text>
              <Text style={[styles.metaValue, { color: Colors.success }]}>
                -₹{order.discountAmount.toLocaleString('en-IN')}
              </Text>
            </View>
          )}
          <View style={styles.cardDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL CONSIGNMENT</Text>
            <Text style={styles.totalValue}>₹{order.totalAmount.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        {isCancellable && (
          <Button
            title={cancelling ? 'CANCELLING...' : 'CANCEL THIS ORDER'}
            variant="outline"
            onPress={handleCancelOrder}
            loading={cancelling}
            style={{ marginBottom: 12, borderColor: Colors.error }}
          />
        )}

        <Button
          title="BACK TO ALL ORDERS"
          variant="ghost"
          onPress={() => navigation.navigate('Orders')}
        />

        {/* Store Footer */}
        <Footer />
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
    padding: 16,
    paddingBottom: 40
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    marginBottom: 16
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  label: {
    color: Colors.accent,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700'
  },
  orderNumber: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2
  },
  dateText: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 4
  },
  sectionTitle: {
    color: Colors.accent,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 14
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: 12,
    paddingHorizontal: 8
  },
  timelineStep: {
    alignItems: 'center',
    flex: 1,
    position: 'relative'
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2
  },
  stepDotActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent
  },
  stepDotCurrent: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4
  },
  stepDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textMuted
  },
  stepLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 6,
    fontWeight: '500'
  },
  stepLabelActive: {
    color: Colors.text
  },
  stepLabelCurrent: {
    color: Colors.accent,
    fontWeight: '700'
  },
  timelineConnector: {
    position: 'absolute',
    top: 13,
    left: '50%',
    width: '100%',
    height: 2,
    backgroundColor: Colors.border,
    zIndex: 1
  },
  connectorActive: {
    backgroundColor: Colors.accent
  },
  cancelledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)'
  },
  cancelledText: {
    color: Colors.error,
    fontSize: 13,
    fontWeight: '600'
  },
  trackingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: Colors.border
  },
  trackingTitle: {
    color: Colors.textMuted,
    fontSize: 11,
    letterSpacing: 1
  },
  trackingCode: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
    gap: 12
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.card
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border
  },
  itemDetails: {
    flex: 1
  },
  itemName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600'
  },
  itemSku: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6
  },
  itemQuantity: {
    color: Colors.textMuted,
    fontSize: 12
  },
  itemPrice: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '700'
  },
  addressBox: {
    gap: 4
  },
  addressName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700'
  },
  addressLine: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 18
  },
  addressPhone: {
    color: Colors.text,
    fontSize: 13,
    marginTop: 4
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  metaLabel: {
    color: Colors.textMuted,
    fontSize: 13
  },
  metaValue: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600'
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  totalLabel: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5
  },
  totalValue: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '800'
  }
});
