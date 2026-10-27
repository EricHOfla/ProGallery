import { createContext, useState, useContext, useEffect } from "react";
import { cartAPI } from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cart from localStorage or API
  useEffect(() => {
    if (isAuthenticated()) {
      loadCartFromAPI();
    } else {
      // Load from localStorage for unauthenticated users
      const savedCart = localStorage.getItem("prodgallery_cart");
      setCart(savedCart ? JSON.parse(savedCart) : []);
    }
  }, [user, isAuthenticated()]);

  // Save cart to localStorage when it changes (for local mode)
  useEffect(() => {
    if (!isAuthenticated()) {
      localStorage.setItem("prodgallery_cart", JSON.stringify(cart));
    }
  }, [cart, isAuthenticated()]);

  const loadCartFromAPI = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      setCart(response);
      setError(null);
    } catch (err) {
      console.error("Failed to load cart:", err);
      setError(err.message);
      // Fall back to localStorage
      const savedCart = localStorage.getItem("prodgallery_cart");
      setCart(savedCart ? JSON.parse(savedCart) : []);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (photo, quantity = 1, licenseType = 'personal') => {
    try {
      if (isAuthenticated()) {
        // Add to API
        const response = await cartAPI.addItem(photo.id, quantity, licenseType);
        // Reload cart to ensure consistency
        await loadCartFromAPI();
      } else {
        // Add to local cart
        setCart((prevCart) => {
          const existingItem = prevCart.find((item) => item.id === photo.id && (item.license_type || 'personal') === licenseType);
          if (existingItem) {
            return prevCart.map((item) =>
              item.id === photo.id && (item.license_type || 'personal') === licenseType
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          }
          return [...prevCart, { ...photo, quantity, license_type: licenseType, price: Number(photo.price) * ({ personal: 1, commercial: 2, extended: 5 }[licenseType] || 1) }];
        });
      }
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeFromCart = async (photoId) => {
    try {
      if (isAuthenticated()) {
        // Find the cart item id
        const cartItem = cart.find((item) => item.photo_id === photoId || item.id === photoId);
        if (cartItem) {
          const previousCart = cart;
          setCart((prevCart) => prevCart.filter((item) => item.id !== cartItem.id));
          try {
            await cartAPI.removeItem(cartItem.id);
          } catch (err) {
            setCart(previousCart);
            throw err;
          }
        }
      } else {
        setCart((prevCart) => prevCart.filter((item) => item.id !== photoId));
      }
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateQuantity = async (photoId, quantity) => {
    const nextQuantity = Number(quantity);
    if (!Number.isFinite(nextQuantity)) {
      return;
    }
    if (nextQuantity <= 0) {
      await removeFromCart(photoId);
      return;
    }

    try {
      if (isAuthenticated()) {
        const cartItem = cart.find((item) => item.photo_id === photoId || item.id === photoId);
        if (cartItem) {
          const previousCart = cart;
          setCart((prevCart) =>
            prevCart.map((item) =>
              item.id === cartItem.id ? { ...item, quantity: nextQuantity } : item
            )
          );
          try {
            await cartAPI.updateItem(cartItem.id, nextQuantity);
          } catch (err) {
            setCart(previousCart);
            throw err;
          }
        }
      } else {
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.id === photoId ? { ...item, quantity: nextQuantity } : item
          )
        );
      }
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      if (isAuthenticated()) {
        await cartAPI.clearCart();
      }
      setCart([]);
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const price = item.price || item.photo?.price || 0;
      const quantity = item.quantity || 1;
      return total + parseFloat(price) * quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
