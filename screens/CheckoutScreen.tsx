import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { CartContext, CartItem } from '../context/CartContext';

const CheckoutScreen: React.FC = () => {
  const router = useRouter();
  const { username } = useContext(AuthContext);
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext);
  
  const [discountCode, setDiscountCode] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Calculate costs
  const subtotal = getCartTotal();
  const shipping = cartItems.length > 0 ? 6.95 : 0;
  const estimatedTaxes = subtotal * 0.094; // 9.4% tax rate
  const total = subtotal + shipping + estimatedTaxes - appliedDiscount;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      Alert.alert('Error', 'Please enter a discount code');
      return;
    }

    setIsApplyingDiscount(true);
    // Simulate API call
    setTimeout(() => {
      if (discountCode.toLowerCase() === 'save10') {
        setAppliedDiscount(subtotal * 0.1); // 10% discount
        Alert.alert('Success', 'Discount code applied! 10% off your order.');
      } else {
        Alert.alert('Error', 'Invalid discount code');
      }
      setIsApplyingDiscount(false);
    }, 1000);
  };

  const handlePayNow = () => {
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
          onPress: () => {
            Alert.alert('Success', 'Payment processed successfully! Your order has been placed.');
            clearCart();
            router.back();
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
      <Text style={styles.productPrice}>${(item.product.price * item.quantity).toFixed(2)}</Text>
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

          {/* Discount Code */}
          <View style={styles.discountContainer}>
            <TextInput
              style={styles.discountInput}
              placeholder="Discount code or gift card"
              placeholderTextColor="#9CA3AF"
              value={discountCode}
              onChangeText={setDiscountCode}
            />
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApplyDiscount}
              disabled={isApplyingDiscount}
            >
              <Text style={styles.applyButtonText}>
                {isApplyingDiscount ? 'Applying...' : 'Apply'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Cost Breakdown */}
          <View style={styles.costBreakdown}>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Subtotal</Text>
              <Text style={styles.costValue}>${subtotal.toFixed(2)}</Text>
            </View>
            
            <View style={styles.costRow}>
              <View style={styles.costLabelContainer}>
                <Text style={styles.costLabel}>Shipping</Text>
                <TouchableOpacity>
                  <Text style={styles.helpIcon}>?</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.costValue}>${shipping.toFixed(2)}</Text>
            </View>
            
            <View style={styles.costRow}>
              <View style={styles.costLabelContainer}>
                <Text style={styles.costLabel}>Estimated taxes</Text>
                <TouchableOpacity>
                  <Text style={styles.helpIcon}>?</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.costValue}>${estimatedTaxes.toFixed(2)}</Text>
            </View>

            {appliedDiscount > 0 && (
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Discount</Text>
                <Text style={[styles.costValue, styles.discountValue]}>-${appliedDiscount.toFixed(2)}</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Upsell Section */}
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
          <Text style={styles.sectionTitle}>Just one more thing</Text>
          
          <View style={styles.upsellCard}>
            <View style={styles.upsellImage}>
              <Text style={styles.upsellImageText}>🧴</Text>
            </View>
            <View style={styles.upsellInfo}>
              <Text style={styles.upsellName}>Premium Product</Text>
              <Text style={styles.upsellSize}>Large (4.2 oz)</Text>
              <Text style={styles.upsellPrice}>$32.00</Text>
            </View>
            <TouchableOpacity style={styles.upsellButton}>
              <Text style={styles.upsellButtonText}>Add</Text>
            </TouchableOpacity>
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
        
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <View style={styles.shopIcon}>
              <Text style={styles.shopIconText}>🛍️</Text>
            </View>
            <Text style={styles.footerText}>Shop</Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.footerText}>curated by</Text>
            <Text style={styles.brandLogo}>MM</Text>
            <Text style={styles.footerText}>YourApp</Text>
          </View>
        </View>
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
  discountContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  discountInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },
  applyButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
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
  discountValue: {
    color: '#059669',
  },
  helpIcon: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  upsellCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  upsellImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upsellImageText: {
    fontSize: 20,
  },
  upsellInfo: {
    flex: 1,
  },
  upsellName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  upsellSize: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  upsellPrice: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  upsellButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  upsellButtonText: {
    color: '#374151',
    fontSize: 12,
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
  footer: {
    backgroundColor: '#374151',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shopIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopIconText: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  brandLogo: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default CheckoutScreen; 