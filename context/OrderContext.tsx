import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    createContext,
    ReactNode,
    useCallback,
    useState
} from 'react';
import { CartItem } from './CartContext';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
  createdAt: string;
  updatedAt: string;
}

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  createOrder: (userId: string, items: CartItem[], total: number) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  loadUserOrders: (userId: string) => Promise<void>;
  clearOrders: () => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
}

export const OrderContext = createContext<OrderContextType>({
  orders: [],
  isLoading: true,
  createOrder: async () => ({} as Order),
  updateOrderStatus: async () => {},
  loadUserOrders: async () => {},
  clearOrders: async () => {},
  getOrderById: () => undefined,
});

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const ORDERS_STORAGE_KEY = '@user_orders';

  const loadUserOrders = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const stored = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
      if (stored) {
        const allOrders: Order[] = JSON.parse(stored);
        const userOrders = allOrders.filter(order => order.userId === userId);
        setOrders(userOrders);
        setCurrentUserId(userId);
      } else {
        setOrders([]);
        setCurrentUserId(userId);
      }
    } catch (error) {
      console.warn('Failed to load user orders', error);
      setOrders([]);
      setCurrentUserId(userId);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createOrder = useCallback(async (userId: string, items: CartItem[], total: number): Promise<Order> => {
    try {
      const newOrder: Order = {
        id: Date.now().toString(),
        userId,
        items,
        total,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Get existing orders
      const stored = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
      const allOrders: Order[] = stored ? JSON.parse(stored) : [];
      
      // Add new order
      const updatedOrders = [...allOrders, newOrder];
      await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
      
      // Update current user's orders
      const userOrders = updatedOrders.filter(order => order.userId === userId);
      setOrders(userOrders);

      return newOrder;
    } catch (error) {
      console.error('Failed to create order', error);
      throw new Error('Failed to create order');
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status']) => {
    try {
      // Get existing orders
      const stored = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
      const allOrders: Order[] = stored ? JSON.parse(stored) : [];
      
      // Find and update the order
      const updatedOrders = allOrders.map(order => 
        order.id === orderId 
          ? { ...order, status, updatedAt: new Date().toISOString() }
          : order
      );
      
      await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
      
      // Update current user's orders
      if (currentUserId) {
        const userOrders = updatedOrders.filter(order => order.userId === currentUserId);
        setOrders(userOrders);
      }
    } catch (error) {
      console.error('Failed to update order status', error);
      throw new Error('Failed to update order status');
    }
  }, [currentUserId]);

  const getOrderById = useCallback((orderId: string): Order | undefined => {
    return orders.find(order => order.id === orderId);
  }, [orders]);

  const clearOrders = useCallback(async () => {
    setOrders([]);
    setCurrentUserId(null);
  }, []);

  return (
    <OrderContext.Provider
      value={{
        orders,
        isLoading,
        createOrder,
        updateOrderStatus,
        loadUserOrders,
        clearOrders,
        getOrderById,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}; 