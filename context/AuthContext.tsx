import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    createContext,
    ReactNode,
    useCallback,
    useEffect,
    useState,
} from 'react';
  
  const STORAGE_KEY = '@logged_in_user';
  
  interface AuthContextType {
    username: string | null;
    isLoggedIn: boolean;
    isLoading: boolean; // restoring state
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
  }
  
  export const AuthContext = createContext<AuthContextType>({
    username: null,
    isLoggedIn: false,
    isLoading: true,
    login: async () => {},
    logout: async () => {},
  });
  
  interface AuthProviderProps {
    children: ReactNode;
  }
  
  export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [username, setUsername] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
  
    // Restore on mount
    useEffect(() => {
      const restore = async () => {
        try {
          const stored = await AsyncStorage.getItem(STORAGE_KEY);
          if (stored) {
            setUsername(stored);
          }
        } catch (error) {
          console.warn('Failed to restore user', error);
        } finally {
          setIsLoading(false);
        }
      };
      restore();
    }, []);
  
    const login = useCallback(async (user: string, password: string) => {
      if (!user.trim() || !password) {
        throw new Error('Username and password are required.');
      }
      // Mock auth: in real app call backend and validate credentials.
      try {
        await AsyncStorage.setItem(STORAGE_KEY, user);
        setUsername(user);
      } catch (error) {
        console.error('Failed to persist login', error);
        throw new Error('Login failed due to storage error.');
      }
    }, []);
  
    const logout = useCallback(async () => {
      try {
        await AsyncStorage.removeItem(STORAGE_KEY);
        setUsername(null);
        // Note: ProductContext will handle clearing products when username changes
      } catch (error) {
        console.warn('Logout failed', error);
      }
    }, []);
  
    return (
      <AuthContext.Provider
        value={{
          username,
          isLoggedIn: !!username,
          isLoading,
          login,
          logout,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  };
  