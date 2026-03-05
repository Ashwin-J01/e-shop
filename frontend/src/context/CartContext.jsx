import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, isCustomer } = useAuth();

  useEffect(() => {
    // Only fetch cart for customers (admins don't have carts)
    if (user && isCustomer) {
      fetchCart();
    } else {
      setCart(null);
      setCartTotal(0);
    }
  }, [user, isCustomer]);

  const fetchCart = async () => {
    // Don't fetch cart for admins
    if (!isCustomer) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get('/api/cart');
      setCart(response.data.cart);
      setCartTotal(response.data.total);
    } catch (error) {
      // Silently handle 403 (admin trying to access cart) or other errors
      if (error.response?.status !== 403) {
        console.error('Fetch cart error:', error);
      }
      setCart(null);
      setCartTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isCustomer) {
      return { success: false, error: 'Only customers can add items to cart' };
    }
    
    try {
      await axios.post('/api/cart', { productId, quantity });
      await fetchCart();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add to cart';
      return { success: false, error: message };
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      await axios.put(`/api/cart/${itemId}`, { quantity });
      await fetchCart();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update cart';
      return { success: false, error: message };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await axios.delete(`/api/cart/${itemId}`);
      await fetchCart();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item';
      return { success: false, error: message };
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete('/api/cart');
      await fetchCart();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      return { success: false, error: message };
    }
  };

  const cartItemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartTotal,
        cartItemCount,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
