import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useContext } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { AuthContext, AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { ProductProvider } from '../context/ProductContext';

import { useColorScheme } from '@/hooks/useColorScheme';

function RootLayoutNav() {
  const { isLoggedIn, isLoading } = useContext(AuthContext);
  const colorScheme = useColorScheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="index" />
            <Stack.Screen name="home" />
            <Stack.Screen name="product" />
            <Stack.Screen name="cart" />
            <Stack.Screen name="checkout" />
          </>
        ) : (
          <Stack.Screen name="login" />
        )}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
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
          <RootLayoutNav />
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}
