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

const CartScreen: React.FC = () => {
  const router = useRouter();
  const { username } = useContext(AuthContext);
  const { 
    cartItems, 
    isLoading, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    loadCart, 
    getCartTotal, 
    getCartItemCount 
  } = useContext(CartContext);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (username) {
      loadCart(username);
    }
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [username, loadCart]);

  const handleRemoveItem = async (productId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from cart?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromCart(productId);
              Alert.alert('Success', 'Item removed from cart!');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove item from cart');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleClearCart = async () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to clear all items from cart?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCart();
              Alert.alert('Success', 'Cart cleared successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cart');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleCheckout = () => {
    Alert.alert(
      'Checkout',
      `Total: $${getCartTotal().toFixed(2)}\n\nProceed to checkout?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Checkout',
          onPress: () => {
            Alert.alert('Success', 'Order placed successfully!');
            clearCart();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderCartItem = ({ item, index }: { item: CartItem; index: number }) => (
    <Animated.View 
      style={[
        styles.cartItemCard,
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
      <View style={styles.cartItemHeader}>
        <View style={styles.cartItemInfo}>
          <Text style={styles.cartItemName}>
            {item.product.name}
          </Text>
          <Text style={styles.cartItemDescription}>
            {item.product.description}
          </Text>

        </View>
        <View style={styles.cartItemPrice}>
          <Text style={styles.cartItemPriceText}>
            ${item.product.price.toFixed(2)}
          </Text>
        </View>
      </View>
      
      <View style={styles.cartItemFooter}>
        <View style={styles.quantityControls}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>
            {item.quantity}
          </Text>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.cartItemActions}>
          <Text style={styles.cartItemTotal}>
            ${(item.product.price * item.quantity).toFixed(2)}
          </Text>
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item.product.id)}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        alwaysBounceVertical={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
              <View>
                <Text style={styles.greeting}>Shopping Cart</Text>
                <Text style={styles.subtitle}>{getCartItemCount()} items</Text>
              </View>
            </View>
            {cartItems.length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={handleClearCart}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {cartItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🛒</Text>
              <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
              <Text style={styles.emptyText}>
                Add some products to your cart to get started
              </Text>
            </View>
          ) : (
            <View style={styles.cartContainer}>
              {cartItems.map((item, index) => (
                <View key={item.product.id} style={styles.cartItemWrapper}>
                  {renderCartItem({ item, index })}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Checkout Footer */}
      {cartItems.length > 0 && (
        <View style={styles.checkoutFooter}>
          <View style={styles.checkoutInfo}>
            <Text style={styles.checkoutTotal}>
              Total: ${getCartTotal().toFixed(2)}
            </Text>
            <Text style={styles.checkoutItems}>
              {getCartItemCount()} items
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  backButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  clearButton: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  cartContainer: {
    paddingBottom: 20,
  },
  cartItemWrapper: {
    marginBottom: 16,
  },
  cartItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cartItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cartItemDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  cartItemPrice: {
    alignItems: 'flex-end',
  },
  cartItemPriceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  cartItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    backgroundColor: '#F3F4F6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    minWidth: 24,
    textAlign: 'center',
  },
  cartItemActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  cartItemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  removeButton: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButtonText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  checkoutFooter: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutInfo: {
    flex: 1,
  },
  checkoutTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  checkoutItems: {
    fontSize: 14,
    color: '#6B7280',
  },
  checkoutButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CartScreen; 