import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { EmptyState } from '../components/EmptyState';
import { LoadingView } from '../components/LoadingView';
import { ErrorView } from '../components/ErrorView';
import { notificationService } from '../services/api/notificationService';
import { NotificationItem } from '../types';

export const NotificationScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setError(null);
      const res = await notificationService.getNotifications();
      setNotifications(res || []);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Unable to retrieve notification stream.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n => notificationService.markAsRead(n.id)));
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const getIconForType = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'order':
      case 'ordercreated':
      case 'orderconfirmed':
      case 'ordershipped':
      case 'orderdelivered':
        return 'bag-check-outline';
      case 'promotion':
      case 'vip':
        return 'diamond-outline';
      case 'payment':
        return 'card-outline';
      default:
        return 'notifications-outline';
    }
  };

  const renderNotificationItem = ({ item }: { item: NotificationItem }) => {
    const timeFormatted = new Date(item.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
        activeOpacity={0.7}
        onPress={() => handleMarkAsRead(item.id)}
      >
        <View style={styles.iconBox}>
          <Ionicons name={getIconForType(item.type) as any} size={22} color={Colors.accent} />
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>

        <View style={styles.contentBox}>
          <View style={styles.headerRow}>
            <Text style={styles.titleText}>{item.title}</Text>
            <Text style={styles.timeText}>{timeFormatted}</Text>
          </View>
          <Text style={styles.messageText}>{item.message}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <Header title="NOTIFICATIONS" showBack onBack={() => navigation.goBack()} />
        <LoadingView message="Loading alerts and dispatch updates..." />
      </View>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="NOTIFICATIONS" showBack onBack={() => navigation.goBack()} />
        <ErrorView message={error} onRetry={fetchNotifications} />
      </View>
    );
  }

  const hasUnread = notifications.some(n => !n.isRead);

  return (
    <View style={styles.container}>
      <Header
        title="NOTIFICATIONS"
        showBack
        onBack={() => navigation.goBack()}
        showSearch
        showCart
        rightElement={
          hasUnread ? (
            <TouchableOpacity onPress={handleMarkAllRead}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderNotificationItem}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={<Footer />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title="All Caught Up"
            description="You have no notifications or status updates at this moment."
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
  markAllText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '700'
  },
  listContent: {
    padding: 16,
    flexGrow: 1
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    alignItems: 'flex-start'
  },
  unreadCard: {
    borderColor: 'rgba(212, 175, 55, 0.4)',
    backgroundColor: 'rgba(212, 175, 55, 0.04)'
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.surface
  },
  contentBox: {
    flex: 1
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4
  },
  titleText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    paddingRight: 8
  },
  timeText: {
    color: Colors.textMuted,
    fontSize: 11
  },
  messageText: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 18
  }
});
