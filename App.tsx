import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';

const App: React.FC = () => (
  <AuthProvider>
    <ProductProvider>
      <CartProvider>
        {/* Expo Router will handle navigation */}
      </CartProvider>
    </ProductProvider>
  </AuthProvider>
);

export default App;
