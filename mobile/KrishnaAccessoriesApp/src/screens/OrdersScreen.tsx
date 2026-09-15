import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { LoadingView } from '../components/LoadingView';
import { ErrorView } from '../components/ErrorView';
import { orderService } from '../services/api/orderService';
import { Order } from '../types';

export const OrdersScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Active' | 'Delivered' | 'Cancelled'>('All');

  const fetchOrders = useCallback(async () => {
    try {
      setError(null);
      const res = await orderService.getUserOrders(1, 50);
      setOrders(res.items || []);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to retrieve order history.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'error' | 'gold' | 'default' => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'confirmed':
      case 'processing':
      case 'shipped':
        return 'gold';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (selectedFilter === 'Active') {
      return ['pending', 'confirmed', 'processing', 'shipped'].includes(order.orderStatus?.toLowerCase());
    }
    if (selectedFilter === 'Delivered') {
      return order.orderStatus?.toLowerCase() === 'delivered';
    }
    if (selectedFilter === 'Cancelled') {
      return order.orderStatus?.toLowerCase() === 'cancelled';
    }
    return true;
  });

  const renderOrderItem = ({ item }: { item: Order }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    return (
      <TouchableOpacity
        style={styles.orderCard}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
            <Text style={styles.orderDate}>{formattedDate}</Text>
          </View>
          <Badge text={item.orderStatus.toUpperCase()} variant={getStatusBadgeVariant(item.orderStatus)} />
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardBody}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Payment</Text>
            <Text style={styles.metaValue}>{item.paymentMethod} • {item.paymentStatus}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Items Count</Text>
            <Text style={styles.metaValue}>{item.items?.length || 1} {item.items?.length === 1 ? 'item' : 'items'}</Text>
          </View>
          {item.trackingNumber ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Tracking #</Text>
              <Text style={styles.metaValue}>{item.trackingNumber}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
            <Text style={styles.totalValue}>₹{item.totalAmount.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.detailsBtn}>
            <Text style={styles.detailsBtnText}>Track Order</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.accent} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <Header title="MY ORDERS" showBack={navigation.canGoBack()} />
        <LoadingView message="Loading your purchase history..." />
      </View>
    );
  }

  if (error && orders.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="MY ORDERS" showBack={navigation.canGoBack()} />
        <ErrorView message={error} onRetry={fetchOrders} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="MY ORDERS"
        subtitle={orders.length > 0 ? `${orders.length} orders` : undefined}
        showBack={navigation.canGoBack()}
        showSearch
        showCart
        showAccount
      />

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['All', 'Active', 'Delivered', 'Cancelled'] as const).map(filter => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={<Footer />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="No Orders Found"
            description={
              selectedFilter === 'All'
                ? "You haven't acquired any luxury items yet. Explore our bespoke catalog."
                : `No orders in the '${selectedFilter}' status.`
            }
            buttonTitle="EXPLORE CATALOG"
            onButtonPress={() => navigation.navigate('HomeTab')}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border
  },
  filterChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent
  },
  filterText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600'
  },
  filterTextActive: {
    color: Colors.primary,
    fontWeight: '700'
  },
  listContent: {
    padding: 16,
    flexGrow: 1
  },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 14
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  orderNumber: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700'
  },
  orderDate: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12
  },
  cardBody: {
    gap: 6
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  metaLabel: {
    color: Colors.textMuted,
    fontSize: 12
  },
  metaValue: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '500'
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  totalLabel: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5
  },
  totalValue: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800'
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  detailsBtnText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '700'
  }
});
