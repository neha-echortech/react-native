import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { CartContext, CartItem } from '../context/CartContext';
import { OrderContext } from '../context/OrderContext';

const CheckoutScreen: React.FC = () => {
  const router = useRouter();
  const { username } = useContext(AuthContext);
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext);
  const { createOrder } = useContext(OrderContext);
  

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Calculate costs
  const subtotal = getCartTotal();
  
  // Calculate original subtotal (before product discounts)
  const originalSubtotal = cartItems.reduce((total, item) => {
    const originalPrice = item.product.originalPrice || item.product.price;
    return total + (originalPrice * item.quantity);
  }, 0);
  
  const shipping = cartItems.length > 0 ? 6.95 : 0;
  const estimatedTaxes = subtotal * 0.094; // 9.4% tax rate
  const total = subtotal + shipping + estimatedTaxes;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);



  const handlePayNow = async () => {
    Alert.alert(
      'Confirm Payment',
      `Total: $${total.toFixed(2)}\n\nProceed with payment?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Pay Now',
          onPress: async () => {
            try {
              // Create order
              await createOrder(username!, cartItems, total);
              Alert.alert('Success', 'Payment processed successfully! Your order has been placed.');
              clearCart();
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to create order. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderCartItem = (item: CartItem) => (
    <View key={`${item.product.id}-${JSON.stringify(item.selectedVariations)}`} style={styles.cartItem}>
      <View style={styles.productImage}>
        <Text style={styles.productImageText}>📦</Text>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.product.name}</Text>
        {item.selectedVariations && Object.keys(item.selectedVariations).length > 0 && (
          <View style={styles.variationsContainer}>
            {Object.entries(item.selectedVariations).map(([variationName, option], index) => (
              <Text key={index} style={styles.variationText}>
                {variationName}: {option}
              </Text>
            ))}
          </View>
        )}
        <Text style={styles.productQuantity}>Qty: {item.quantity}</Text>
      </View>
      <View style={styles.priceContainer}>
        {item.product.discountPercentage ? (
          <View style={styles.discountedPriceContainer}>
            <Text style={styles.originalPrice}>
              ${(item.product.originalPrice! * item.quantity).toFixed(2)}
            </Text>
            <Text style={styles.productPrice}>
              ${(item.product.price * item.quantity).toFixed(2)}
            </Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>
                -{item.product.discountPercentage}%
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.productPrice}>
            ${(item.product.price * item.quantity).toFixed(2)}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>×</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review & Pay</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Order Summary Section */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                })
              }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Order summary</Text>
          
          <View style={styles.cartItemsContainer}>
            {cartItems.map(renderCartItem)}
          </View>



          {/* Cost Breakdown */}
          <View style={styles.costBreakdown}>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Item(s) total</Text>
              <Text style={styles.costValue}>${originalSubtotal.toFixed(2)}</Text>
            </View>
            
            {(originalSubtotal > subtotal) && (
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Shop discount</Text>
                <Text style={[styles.costValue, styles.discountValue]}>-${(originalSubtotal - subtotal).toFixed(2)}</Text>
              </View>
            )}
            
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Delivery total</Text>
              <Text style={styles.costValue}>{shipping > 0 ? `$${shipping.toFixed(2)}` : 'Free'}</Text>
            </View>
            
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Estimated taxes</Text>
              <Text style={styles.costValue}>${estimatedTaxes.toFixed(2)}</Text>
            </View>
            
            <View style={styles.orderTotalSeparator} />
            
            <View style={styles.orderTotalRow}>
              <Text style={styles.orderTotalLabel}>
                Order total ({cartItems.reduce((count, item) => count + item.quantity, 0)} item{cartItems.reduce((count, item) => count + item.quantity, 0) !== 1 ? 's' : ''}):
              </Text>
              <Text style={styles.orderTotalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </Animated.View>


      </ScrollView>

      {/* Payment Footer */}
      <View style={styles.paymentFooter}>
        <TouchableOpacity 
          style={styles.payButton}
          onPress={handlePayNow}
        >
          <Text style={styles.payButtonText}>Pay now</Text>
          <View style={styles.payButtonDivider} />
          <Text style={styles.payButtonTotal}>${total.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  cartItemsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImageText: {
    fontSize: 20,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  variationsContainer: {
    marginBottom: 2,
  },
  variationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  productQuantity: {
    fontSize: 12,
    color: '#6B7280',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  discountedPriceContainer: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  discountBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginTop: 2,
  },
  discountBadgeText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#DC2626',
  },

  costBreakdown: {
    gap: 12,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  costLabel: {
    fontSize: 14,
    color: '#374151',
  },
  costValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  discountedSubtotalContainer: {
    alignItems: 'flex-end',
  },
  originalSubtotal: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  discountValue: {
    color: '#059669',
  },
  orderTotalSeparator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  orderTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  orderTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  helpIcon: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  paymentFooter: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  payButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  payButtonDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#FFFFFF',
    opacity: 0.3,
  },
  payButtonTotal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CheckoutScreen; 