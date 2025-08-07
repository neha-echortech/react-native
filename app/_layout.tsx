import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { ProductProvider } from '../context/ProductContext';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="home" options={{ headerShown: false }} />
              <Stack.Screen 
                name="product" 
                options={{ 
                  title: 'Create Product',
                  headerShown: true,
                  headerStyle: {
                    backgroundColor: '#007AFF',
                  },
                  headerTintColor: '#fff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }} 
              />
              <Stack.Screen name="cart" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}
