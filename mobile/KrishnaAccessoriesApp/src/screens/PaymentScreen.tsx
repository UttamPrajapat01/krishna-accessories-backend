import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import WebView from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { paymentService, RazorpayOrderInfo } from '../services/api/paymentService';
import { useAuth } from '../context/AuthContext';

// ─── Razorpay Checkout HTML ──────────────────────────────────────────────────
const buildRazorpayHtml = (info: RazorpayOrderInfo, userName: string, userEmail: string, userPhone: string): string => {
  // Amount must be in paise (integer) for the checkout SDK
  const amountInPaise = Math.round(info.amount * 100);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <title>Krishna Accessories Payment</title>
  <style>
    body { margin: 0; background: #0a0a0a; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
    .loader { color: #D4AF37; font-size: 15px; text-align: center; }
    .spinner { border: 3px solid #333; border-top: 3px solid #D4AF37; border-radius: 50%; width: 36px; height: 36px; animation: spin 0.8s linear infinite; margin: 0 auto 14px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="loader">
    <div class="spinner"></div>
    Loading Razorpay Checkout...
  </div>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <script>
    window.onload = function() {
      var options = {
        key: "${info.keyId}",
        amount: ${amountInPaise},
        currency: "${info.currency}",
        name: "Krishna Accessories",
        description: "Order ${info.orderNumber}",
        order_id: "${info.razorpayOrderId}",
        prefill: {
          name: "${userName.replace(/"/g, '\\"')}",
          email: "${userEmail.replace(/"/g, '\\"')}",
          contact: "${userPhone.replace(/"/g, '\\"')}"
        },
        theme: { color: "#D4AF37", backdrop_color: "#0a0a0a" },
        modal: {
          ondismiss: function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: "dismissed" }));
          }
        },
        handler: function(response) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "success",
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          }));
        }
      };

      try {
        var rzp = new Razorpay(options);
        rzp.on("payment.failed", function(response) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "failed",
            code: response.error.code,
            description: response.error.description,
            reason: response.error.reason
          }));
        });
        rzp.open();
      } catch(e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: "error", message: e.message }));
      }
    };
  </script>
</body>
</html>
  `;
};

// ─── Component ───────────────────────────────────────────────────────────────
export const PaymentScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { orderId, orderNumber, amount } = route.params || {};
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [razorpayOrder, setRazorpayOrder] = useState<RazorpayOrderInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    initiateRazorpayOrder();
  }, [orderId]);

  const initiateRazorpayOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const info = await paymentService.createRazorpayOrder(orderId);
      setRazorpayOrder(info);
    } catch (err: any) {
      console.error('Failed to create Razorpay order', err);
      setError(err.response?.data?.message || 'Could not connect to Razorpay secure servers.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCheckout = () => {
    if (!razorpayOrder) return;
    setShowWebView(true);
  };

  const handleWebViewMessage = useCallback(async (event: WebViewMessageEvent) => {
    let msg: any;
    try {
      msg = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }

    if (msg.type === 'success') {
      setShowWebView(false);
      setProcessing(true);
      try {
        const verified = await paymentService.verifyPayment(
          orderId,
          msg.razorpay_order_id,
          msg.razorpay_payment_id,
          msg.razorpay_signature
        );
        if (verified) {
          navigation.replace('OrderSuccess', {
            orderId,
            orderNumber: orderNumber || razorpayOrder?.orderNumber,
            amount: amount || razorpayOrder?.amount,
          });
        } else {
          Alert.alert(
            'Verification Failed',
            'Payment was received but server verification failed. Please contact support with your order number.'
          );
        }
      } catch (err: any) {
        Alert.alert(
          'Payment Error',
          err.response?.data?.message || 'Payment verification failed. Please contact support.'
        );
      } finally {
        setProcessing(false);
      }
    } else if (msg.type === 'failed') {
      setShowWebView(false);
      Alert.alert(
        'Payment Failed',
        `${msg.description || 'Your payment could not be processed.'}\n\nReason: ${msg.reason || 'Unknown'}`,
        [
          { text: 'Try Again', onPress: handleOpenCheckout },
          { text: 'Pay Later', onPress: () => navigation.navigate('Orders') },
        ]
      );
    } else if (msg.type === 'dismissed') {
      setShowWebView(false);
    } else if (msg.type === 'error') {
      setShowWebView(false);
      Alert.alert('Gateway Error', msg.message || 'Razorpay checkout failed to load.');
    }
  }, [orderId, razorpayOrder, orderNumber, amount]);

  const razorpayHtml = razorpayOrder
    ? buildRazorpayHtml(
        razorpayOrder,
        user?.fullName || 'Customer',
        user?.email || '',
        user?.phoneNumber || ''
      )
    : null;

  return (
    <View style={styles.container}>
      <Header
        title="SECURE PAYMENT"
        showBack
        onBack={() => navigation.goBack()}
        showSearch={false}
        showCart={false}
      />

      {/* Razorpay Checkout Modal */}
      <Modal
        visible={showWebView}
        animationType="slide"
        onRequestClose={() => {
          setShowWebView(false);
        }}
      >
        <View style={styles.webViewContainer}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={() => setShowWebView(false)}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
          {razorpayHtml && (() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const RazorpayWebView = WebView as any;
            return (
              <RazorpayWebView
                ref={webViewRef}
                source={{ html: razorpayHtml }}
                onMessage={handleWebViewMessage}
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState
                renderLoading={() => (
                  <View style={styles.webViewLoader}>
                    <ActivityIndicator size="large" color={Colors.accent} />
                    <Text style={styles.loadingText}>Loading Razorpay...</Text>
                  </View>
                )}
                style={styles.webView}
              />
            );
          })()}
        </View>
      </Modal>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Order Summary */}
        <View style={styles.orderCard}>
          <Text style={styles.orderLabel}>ORDER REFERENCE</Text>
          <Text style={styles.orderNumber}>{orderNumber || 'KA-ORDER'}</Text>
          <View style={styles.divider} />
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Total Payable</Text>
            <Text style={styles.amountValue}>₹{(amount || 0).toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text style={styles.loadingText}>Initializing Razorpay Secure Gateway...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
            <Text style={styles.errorTitle}>Gateway Connection Failed</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <Button title="RETRY CONNECTION" onPress={initiateRazorpayOrder} style={{ marginTop: 16 }} />
          </View>
        ) : (
          <View style={styles.gatewayCard}>
            {/* Gateway Header */}
            <View style={styles.gatewayHeader}>
              <View style={styles.badgeRow}>
                <Ionicons name="shield-checkmark" size={20} color={Colors.accent} />
                <Text style={styles.gatewayTitle}>Razorpay Secure</Text>
              </View>
              <Text style={styles.encryptedText}>256-BIT SSL ENCRYPTED</Text>
            </View>

            <Text style={styles.gatewayDescription}>
              Pay securely using UPI, Credit/Debit Cards, Net Banking, or Wallets.
            </Text>

            {/* Payment Methods Grid */}
            <View style={styles.methodsGrid}>
              {[
                { icon: 'card-outline', label: 'Credit /\nDebit' },
                { icon: 'flash-outline', label: 'UPI / QR' },
                { icon: 'business-outline', label: 'Net\nBanking' },
                { icon: 'wallet-outline', label: 'Wallets' },
              ].map((m) => (
                <View key={m.label} style={styles.methodItem}>
                  <Ionicons name={m.icon as any} size={24} color={Colors.accent} />
                  <Text style={styles.methodLabel}>{m.label}</Text>
                </View>
              ))}
            </View>

            {/* Razorpay Order ID */}
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Razorpay Order ID</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{razorpayOrder?.razorpayOrderId}</Text>
            </View>

            {/* Pay Button */}
            <Button
              title={processing ? 'VERIFYING WITH SERVER...' : `PAY ₹${(amount || razorpayOrder?.amount || 0).toLocaleString('en-IN')}`}
              onPress={handleOpenCheckout}
              loading={processing}
              style={{ marginTop: 24 }}
            />

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.navigate('Orders')}
            >
              <Text style={styles.cancelText}>Pay Later / View in Orders</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Trust Badges */}
        <View style={styles.trustBadges}>
          <View style={styles.trustItem}>
            <Ionicons name="lock-closed" size={16} color={Colors.textMuted} />
            <Text style={styles.trustText}>PCI-DSS Level 1 Compliant</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="shield-checkmark" size={16} color={Colors.textMuted} />
            <Text style={styles.trustText}>100% Authentic Luxury Guarantee</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 20 },
  webViewContainer: { flex: 1, backgroundColor: '#0a0a0a' },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 6,
  },
  webView: { flex: 1 },
  webViewLoader: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0a',
  },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    marginBottom: 20,
  },
  orderLabel: { color: Colors.accent, fontSize: 11, letterSpacing: 2, fontWeight: '700' },
  orderNumber: { color: Colors.text, fontSize: 20, fontWeight: '700', marginTop: 4 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 14 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amountLabel: { color: Colors.textMuted, fontSize: 14 },
  amountValue: { color: Colors.accent, fontSize: 22, fontWeight: '800' },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
  loadingText: { color: Colors.textMuted, fontSize: 13, marginTop: 14, letterSpacing: 1 },
  errorBox: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: 24,
    alignItems: 'center',
    marginVertical: 20,
  },
  errorTitle: { color: Colors.text, fontSize: 16, fontWeight: '700', marginTop: 12 },
  errorMessage: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 6 },
  gatewayCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.accent,
    padding: 20,
    marginBottom: 20,
  },
  gatewayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gatewayTitle: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  encryptedText: { color: Colors.accent, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  gatewayDescription: { color: Colors.textMuted, fontSize: 13, lineHeight: 18, marginBottom: 18 },
  methodsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  methodItem: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    width: '23%',
  },
  methodLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: '600', marginTop: 6, textAlign: 'center' },
  infoBox: { backgroundColor: Colors.card, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: Colors.border },
  infoLabel: { color: Colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  infoValue: { color: Colors.text, fontSize: 12, fontFamily: 'Courier', marginTop: 4 },
  cancelButton: { marginTop: 16, alignItems: 'center', paddingVertical: 8 },
  cancelText: { color: Colors.textMuted, fontSize: 13, textDecorationLine: 'underline' },
  trustBadges: { marginTop: 10, gap: 8, alignItems: 'center' },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trustText: { color: Colors.textMuted, fontSize: 11 },
});
