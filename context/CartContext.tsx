import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    createContext,
    ReactNode,
    useCallback,
    useState
} from 'react';
import { Product } from './ProductContext';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: (userId: string) => Promise<void>;
  refreshCartItems: () => Promise<void>;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

export const CartContext = createContext<CartContextType>({
  cartItems: [],
  isLoading: true,
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  loadCart: async () => {},
  refreshCartItems: async () => {},
  getCartTotal: () => 0,
  getCartItemCount: () => 0,
});

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const CART_STORAGE_KEY = '@user_cart';

  const loadCart = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const allCarts: { userId: string; cartItems: CartItem[] }[] = JSON.parse(stored);
        const userCart = allCarts.find(cart => cart.userId === userId);
        if (userCart) {
          setCartItems(userCart.cartItems);
        } else {
          setCartItems([]);
        }
        setCurrentUserId(userId);
      } else {
        setCartItems([]);
        setCurrentUserId(userId);
      }
    } catch (error) {
      console.warn('Failed to load cart', error);
      setCartItems([]);
      setCurrentUserId(userId);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (product: Product) => {
    try {
      const existingItem = cartItems.find(item => item.product.id === product.id);
      
      let updatedCartItems: CartItem[];
      if (existingItem) {
        // If item exists, increase quantity
        updatedCartItems = cartItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // If item doesn't exist, add new item
        updatedCartItems = [...cartItems, { product, quantity: 1 }];
      }

      setCartItems(updatedCartItems);

      // Save to AsyncStorage
      const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
      const allCarts: { userId: string; cartItems: CartItem[] }[] = stored ? JSON.parse(stored) : [];
      
      const existingCartIndex = allCarts.findIndex(cart => cart.userId === currentUserId);
      if (existingCartIndex !== -1) {
        allCarts[existingCartIndex].cartItems = updatedCartItems;
      } else {
        allCarts.push({ userId: currentUserId!, cartItems: updatedCartItems });
      }
      
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(allCarts));
    } catch (error) {
      console.error('Failed to add to cart', error);
      throw new Error('Failed to add to cart');
    }
  }, [cartItems, currentUserId]);

  const removeFromCart = useCallback(async (productId: string) => {
    try {
      const updatedCartItems = cartItems.filter(item => item.product.id !== productId);
      setCartItems(updatedCartItems);

      // Save to AsyncStorage
      const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
      const allCarts: { userId: string; cartItems: CartItem[] }[] = stored ? JSON.parse(stored) : [];
      
      const existingCartIndex = allCarts.findIndex(cart => cart.userId === currentUserId);
      if (existingCartIndex !== -1) {
        allCarts[existingCartIndex].cartItems = updatedCartItems;
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(allCarts));
      }
    } catch (error) {
      console.error('Failed to remove from cart', error);
      throw new Error('Failed to remove from cart');
    }
  }, [cartItems, currentUserId]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      const updatedCartItems = cartItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );

      setCartItems(updatedCartItems);

      // Save to AsyncStorage
      const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
      const allCarts: { userId: string; cartItems: CartItem[] }[] = stored ? JSON.parse(stored) : [];
      
      const existingCartIndex = allCarts.findIndex(cart => cart.userId === currentUserId);
      if (existingCartIndex !== -1) {
        allCarts[existingCartIndex].cartItems = updatedCartItems;
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(allCarts));
      }
    } catch (error) {
      console.error('Failed to update quantity', error);
      throw new Error('Failed to update quantity');
    }
  }, [cartItems, currentUserId, removeFromCart]);

  const clearCart = useCallback(async () => {
    try {
      setCartItems([]);

      // Save to AsyncStorage
      const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
      const allCarts: { userId: string; cartItems: CartItem[] }[] = stored ? JSON.parse(stored) : [];
      
      const existingCartIndex = allCarts.findIndex(cart => cart.userId === currentUserId);
      if (existingCartIndex !== -1) {
        allCarts[existingCartIndex].cartItems = [];
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(allCarts));
      }
    } catch (error) {
      console.error('Failed to clear cart', error);
      throw new Error('Failed to clear cart');
    }
  }, [currentUserId]);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [cartItems]);

  const getCartItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const refreshCartItems = useCallback(async () => {
    try {
      // Get the latest product data from AsyncStorage
      const PRODUCTS_STORAGE_KEY = '@user_products';
      const storedProducts = await AsyncStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (!storedProducts || !currentUserId) return;
      
      const allProducts: Product[] = JSON.parse(storedProducts);
      const userProducts = allProducts.filter(product => product.userId === currentUserId);
      
      // Create a map of updated products for quick lookup
      const productMap = new Map(userProducts.map(product => [product.id, product]));
      
      // Update cart items with the latest product data
      const updatedCartItems = cartItems.map(item => {
        const updatedProduct = productMap.get(item.product.id);
        if (updatedProduct) {
          return { ...item, product: updatedProduct };
        }
        return item;
      });

      setCartItems(updatedCartItems);

      // Save to AsyncStorage
      const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
      const allCarts: { userId: string; cartItems: CartItem[] }[] = stored ? JSON.parse(stored) : [];
      
      const existingCartIndex = allCarts.findIndex(cart => cart.userId === currentUserId);
      if (existingCartIndex !== -1) {
        allCarts[existingCartIndex].cartItems = updatedCartItems;
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(allCarts));
      }
    } catch (error) {
      console.error('Failed to refresh cart items', error);
      throw new Error('Failed to refresh cart items');
    }
  }, [cartItems, currentUserId]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        loadCart,
        refreshCartItems,
        getCartTotal,
        getCartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}; 