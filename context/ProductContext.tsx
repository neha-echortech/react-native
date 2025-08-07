import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    createContext,
    ReactNode,
    useCallback,
    useState
} from 'react';

export interface ProductVariation {
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  variations?: ProductVariation[];
  createdAt: string;
  userId: string;
}

interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  createProduct: (name: string, description: string, price: number, userId: string, variations?: ProductVariation[]) => Promise<void>;
  updateProduct: (id: string, name: string, description: string, price: number, variations?: ProductVariation[]) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  loadUserProducts: (userId: string) => Promise<void>;
  clearProducts: () => Promise<void>;
}

export const ProductContext = createContext<ProductContextType>({
  products: [],
  isLoading: true,
  createProduct: async () => {},
  updateProduct: async () => {},
  deleteProduct: async () => {},
  loadUserProducts: async () => {},
  clearProducts: async () => {},
});

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const PRODUCTS_STORAGE_KEY = '@user_products';

  const loadUserProducts = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const stored = await AsyncStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (stored) {
        const allProducts: Product[] = JSON.parse(stored);
        const userProducts = allProducts.filter(product => product.userId === userId);
        setProducts(userProducts);
        setCurrentUserId(userId);
      } else {
        setProducts([]);
        setCurrentUserId(userId);
      }
    } catch (error) {
      console.warn('Failed to load user products', error);
      setProducts([]);
      setCurrentUserId(userId);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (name: string, description: string, price: number, userId: string, variations?: ProductVariation[]) => {
    try {
      const newProduct: Product = {
        id: Date.now().toString(),
        name,
        description,
        price,
        variations,
        createdAt: new Date().toISOString(),
        userId,
      };

      // Get existing products
      const stored = await AsyncStorage.getItem(PRODUCTS_STORAGE_KEY);
      const allProducts: Product[] = stored ? JSON.parse(stored) : [];
      
      // Add new product
      const updatedProducts = [...allProducts, newProduct];
      await AsyncStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));
      
      // Update current user's products
      const userProducts = updatedProducts.filter(product => product.userId === userId);
      setProducts(userProducts);
    } catch (error) {
      console.error('Failed to create product', error);
      throw new Error('Failed to create product');
    }
  }, []);

  const updateProduct = useCallback(async (id: string, name: string, description: string, price: number, variations?: ProductVariation[]) => {
    try {
      // Get existing products
      const stored = await AsyncStorage.getItem(PRODUCTS_STORAGE_KEY);
      const allProducts: Product[] = stored ? JSON.parse(stored) : [];
      
      // Find and update the product
      const updatedProducts = allProducts.map(product => 
        product.id === id 
          ? { ...product, name, description, price, variations }
          : product
      );
      
      await AsyncStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));
      
      // Update current user's products
      if (currentUserId) {
        const userProducts = updatedProducts.filter(product => product.userId === currentUserId);
        setProducts(userProducts);
      }
    } catch (error) {
      console.error('Failed to update product', error);
      throw new Error('Failed to update product');
    }
  }, [currentUserId]);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      // Get existing products
      const stored = await AsyncStorage.getItem(PRODUCTS_STORAGE_KEY);
      const allProducts: Product[] = stored ? JSON.parse(stored) : [];
      
      // Remove the product
      const updatedProducts = allProducts.filter(product => product.id !== id);
      await AsyncStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));
      
      // Update current user's products
      if (currentUserId) {
        const userProducts = updatedProducts.filter(product => product.userId === currentUserId);
        setProducts(userProducts);
      }
    } catch (error) {
      console.error('Failed to delete product', error);
      throw new Error('Failed to delete product');
    }
  }, [currentUserId]);

  const clearProducts = useCallback(async () => {
    setProducts([]);
    setCurrentUserId(null);
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        isLoading,
        createProduct,
        updateProduct,
        deleteProduct,
        loadUserProducts,
        clearProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}; 