
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { Product } from '@/services/productService';
import { toast } from 'sonner';
import { 
  listenToSmartTrolley, 
  RtdbCartData, 
  updateTotalPrice, 
  shouldProductBeInCart, 
  getProductQuantityFromRtdb,
  updateProductInCart,
  removeProductFromCart,
  clearCart as clearRtdbCart,
  updateCartTotalPrice
} from '@/services/rtdbService';

// Define cart item type
export interface CartItem extends Product {
  quantity: number;
}

// Define cart state
interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  rtdbSynced: boolean;
}

// Define cart actions
type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SYNC_WITH_RTDB'; payload: { products: Product[]; rtdbData: RtdbCartData } };

// Create initial state
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  rtdbSynced: false,
};

// Create reducer function
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      if (existingItemIndex !== -1) {
        // Item already exists, increase quantity
        const updatedItems = [...state.items];
        const newQuantity = updatedItems[existingItemIndex].quantity + 1;
        
        // Update RTDB for this specific product
        updateProductInCart(action.payload.name.toLowerCase(), newQuantity);

        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newQuantity,
        };

        return {
          ...state,
          items: updatedItems,
          totalItems: state.totalItems + 1,
          totalPrice: state.totalPrice + action.payload.price,
        };
      } else {
        // Add new item with quantity 1
        const newItem: CartItem = { ...action.payload, quantity: 1 };
        
        // Update RTDB for this new product
        updateProductInCart(newItem.name.toLowerCase(), 1);

        return {
          ...state,
          items: [...state.items, newItem],
          totalItems: state.totalItems + 1,
          totalPrice: state.totalPrice + action.payload.price,
        };
      }
    }
    
    case 'REMOVE_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload);
      
      if (!existingItem) return state;
      
      // Remove from RTDB
      removeProductFromCart(existingItem.name.toLowerCase());
      
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      
      return {
        ...state,
        items: filteredItems,
        totalItems: state.totalItems - existingItem.quantity,
        totalPrice: state.totalPrice - (existingItem.price * existingItem.quantity),
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === id);
      
      if (itemIndex === -1) return state;
      
      const item = state.items[itemIndex];
      const quantityDifference = quantity - item.quantity;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        removeProductFromCart(item.name.toLowerCase());
        
        const filteredItems = state.items.filter(item => item.id !== id);
        
        return {
          ...state,
          items: filteredItems,
          totalItems: state.totalItems - item.quantity,
          totalPrice: state.totalPrice - (item.price * item.quantity),
        };
      }
      
      // Update RTDB for this product
      updateProductInCart(item.name.toLowerCase(), quantity);
      
      // Update item quantity
      const updatedItems = [...state.items];
      updatedItems[itemIndex] = { ...item, quantity };
      
      return {
        ...state,
        items: updatedItems,
        totalItems: state.totalItems + quantityDifference,
        totalPrice: state.totalPrice + (item.price * quantityDifference),
      };
    }
    
    case 'CLEAR_CART': {
      // Clear RTDB cart
      clearRtdbCart();
      
      return {
        ...initialState,
        rtdbSynced: state.rtdbSynced,
      };
    }
    
    case 'SYNC_WITH_RTDB': {
      const { products, rtdbData } = action.payload;
      let newItems: CartItem[] = [];
      let newTotalItems = 0;
      let newTotalPrice = 0;
      
      // Add products based on RFID data
      products.forEach(product => {
        const productName = product.name.toLowerCase();
        if (shouldProductBeInCart(productName, rtdbData)) {
          const quantity = getProductQuantityFromRtdb(productName, rtdbData);
          if (quantity > 0) {
            newItems.push({
              ...product,
              quantity
            });
            newTotalItems += quantity;
            newTotalPrice += product.price * quantity;
          }
        }
      });
      
      return {
        items: newItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice,
        rtdbSynced: true,
      };
    }
      
    default:
      return state;
  }
};

// Create context
interface CartContextType extends CartState {
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  syncWithRtdb: (products: Product[], rtdbData: RtdbCartData) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Create provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState, () => {
    // Load cart from localStorage if available
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? { ...JSON.parse(savedCart), rtdbSynced: false } : initialState;
    }
    return initialState;
  });
  
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [rtdbData, setRtdbData] = useState<RtdbCartData>({});
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
    if (state.totalPrice > 0) {
      updateCartTotalPrice(state.totalPrice);
    }
  }, [state]);
  
  // Listen to RTDB updates
  useEffect(() => {
    const unsubscribe = listenToSmartTrolley((data) => {
      setRtdbData(data);
      
      // If we have products and RTDB data, sync the cart
      if (allProducts.length > 0) {
        syncWithRtdb(allProducts, data);
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [allProducts]);
  
  // Action creators
  const addItem = (product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
    toast.success(`${product.name} added to cart`);
  };
  
  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
    toast.success('Item removed from cart');
  };
  
  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
  };
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    toast.success('Cart cleared');
  };
  
  const syncWithRtdb = (products: Product[], rtdbData: RtdbCartData) => {
    setAllProducts(products);
    dispatch({ 
      type: 'SYNC_WITH_RTDB', 
      payload: { 
        products, 
        rtdbData 
      } 
    });
  };
  
  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        syncWithRtdb,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Create custom hook for using the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
