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
import { Order, OrderContext } from '../context/OrderContext';

const OrderScreen: React.FC = () => {
  const router = useRouter();
  const { username } = useContext(AuthContext);
  const { orders, isLoading, loadUserOrders, updateOrderStatus } = useContext(OrderContext);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (username) {
      loadUserOrders(username);
    }
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [username, loadUserOrders]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return '#F59E0B';
      case 'Processing':
        return '#3B82F6';
      case 'Shipped':
        return '#8B5CF6';
      case 'Delivered':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return '⏳';
      case 'Processing':
        return '⚙️';
      case 'Shipped':
        return '📦';
      case 'Delivered':
        return '✅';
      default:
        return '📋';
    }
  };

  const handleUpdateStatus = async (order: Order) => {
    const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    const currentIndex = statusOptions.indexOf(order.status);
    const nextStatus = statusOptions[(currentIndex + 1) % statusOptions.length] as Order['status'];

    Alert.alert(
      'Update Order Status',
      `Change status from "${order.status}" to "${nextStatus}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Update',
          onPress: async () => {
            try {
              await updateOrderStatus(order.id, nextStatus);
              Alert.alert('Success', 'Order status updated successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to update order status');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderOrder = ({ item, index }: { item: Order; index: number }) => (
    <Animated.View 
      style={[
        styles.orderCard,
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
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>
            Order #{item.id.slice(-6)}
          </Text>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        <View 
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) }
          ]}
        >
          <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.orderItems}>
        <Text style={styles.itemsTitle}>
          Items ({item.items.length}):
        </Text>
        {item.items.map((cartItem, itemIndex) => (
          <View key={itemIndex} style={styles.orderItem}>
            <Text style={styles.itemName}>{cartItem.product.name}</Text>
            <Text style={styles.itemQuantity}>x{cartItem.quantity}</Text>
            <Text style={styles.itemPrice}>
              ${(cartItem.product.price * cartItem.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>
          Total: ${item.total.toFixed(2)}
        </Text>
        <TouchableOpacity 
          style={styles.updateButton}
          onPress={() => handleUpdateStatus(item)}
        >
          <Text style={styles.updateButtonText}>Update Status</Text>
        </TouchableOpacity>
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
                <Text style={styles.greeting}>Order History</Text>
                <Text style={styles.subtitle}>{orders.length} orders</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No Orders Yet</Text>
              <Text style={styles.emptyText}>
                Your order history will appear here once you place your first order
              </Text>
            </View>
          ) : (
            <View style={styles.ordersContainer}>
              {orders.map((order, index) => (
                <View key={order.id} style={styles.orderWrapper}>
                  {renderOrder({ item: order, index })}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  ordersContainer: {
    paddingBottom: 20,
  },
  orderWrapper: {
    marginBottom: 16,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusIcon: {
    fontSize: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  orderItems: {
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  itemName: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6B7280',
    marginHorizontal: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  updateButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
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
});

export default OrderScreen; 