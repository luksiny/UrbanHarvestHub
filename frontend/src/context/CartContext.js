import React, { createContext, useContext, useReducer, useCallback } from 'react';

const CartContext = createContext(null);

const CART_KEY = 'urbanHarvestHub_cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {}
}

function cartReducer(state, action) {
  let next;
  switch (action.type) {
    case 'ADD': {
      const { productId, name, price, quantity = 1, unit = 'piece' } = action.payload;
      const existing = state.find((i) => i.productId === productId);
      if (existing) {
        next = state.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        next = [...state, { productId, name, price: Number(price), quantity, unit }];
      }
      break;
    }
    case 'REMOVE':
      next = state.filter((i) => i.productId !== action.payload.productId);
      break;
    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      if (quantity < 1) {
        next = state.filter((i) => i.productId !== productId);
      } else {
        next = state.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        );
      }
      break;
    }
    case 'CLEAR':
      next = [];
      break;
    case 'SET':
      next = Array.isArray(action.payload) ? action.payload : [];
      break;
    default:
      return state;
  }
  saveCart(next);
  return next;
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, loadCart());

  const addItem = useCallback((item) => {
    dispatch({ type: 'ADD', payload: item });
  }, []);

  const removeItem = useCallback((productId) => {
    dispatch({ type: 'REMOVE', payload: { productId } });
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const total = items.reduce((sum, i) => sum + Number(i.price) * (i.quantity || 1), 0);
  const count = items.reduce((sum, i) => sum + (i.quantity || 1), 0);

  const value = {
    items,
    total,
    count,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
