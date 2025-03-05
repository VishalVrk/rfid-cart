
import { ref, onValue, set, remove } from 'firebase/database';
import { rtdb } from '@/lib/firebase';
import { Product } from './productService';

// Path to the smart trolley data in Realtime Database
const SMART_TROLLEY_PATH = 'smart_trolley';

// Interface for real-time cart data
export interface RtdbCartData {
  apple?: string;
  mango?: string;
  tomato?: string;
  totalPrice?: string;
  [key: string]: string | undefined;
}

// Function to listen to smart trolley updates
export const listenToSmartTrolley = (callback: (data: RtdbCartData) => void) => {
  const trolleyRef = ref(rtdb, SMART_TROLLEY_PATH);
  
  const unsubscribe = onValue(trolleyRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val() as RtdbCartData;
      callback(data);
    } else {
      console.log("No smart trolley data available");
      callback({});
    }
  }, (error) => {
    console.error("Error listening to smart trolley:", error);
  });
  
  return unsubscribe;
};

// Function to update total price in realtime database
export const updateTotalPrice = async (totalPrice: number) => {
  try {
    const trolleyRef = ref(rtdb, `${SMART_TROLLEY_PATH}/totalPrice`);
    await set(trolleyRef, totalPrice.toString());
    return true;
  } catch (error) {
    console.error("Error updating total price:", error);
    return false;
  }
};

// Function to check if a product should be in cart based on RFID data
export const shouldProductBeInCart = (productName: string, rtdbData: RtdbCartData): boolean => {
  const normalizedName = productName.toLowerCase();
  
  // Check if the product exists in the RFID data with a quantity
  return !!rtdbData[normalizedName] && rtdbData[normalizedName] !== "0";
};

// Get the quantity of a product from RFID data
export const getProductQuantityFromRtdb = (productName: string, rtdbData: RtdbCartData): number => {
  const normalizedName = productName.toLowerCase();
  
  if (rtdbData[normalizedName]) {
    return parseInt(rtdbData[normalizedName] || "0", 10);
  }
  
  return 0;
};

// Function to update a specific product quantity in the cart
export const updateProductInCart = async (productName: string, quantity: number) => {
  try {
    const productRef = ref(rtdb, `${SMART_TROLLEY_PATH}/${productName.toLowerCase()}`);
    await set(productRef, quantity.toString());
    return true;
  } catch (error) {
    console.error(`Error updating ${productName} quantity:`, error);
    return false;
  }
};

// Function to remove a product from the cart
export const removeProductFromCart = async (productName: string) => {
  try {
    const productRef = ref(rtdb, `${SMART_TROLLEY_PATH}/${productName.toLowerCase()}`);
    await remove(productRef);
    return true;
  } catch (error) {
    console.error(`Error removing ${productName} from cart:`, error);
    return false;
  }
};

// Function to clear the entire cart
export const clearCart = async () => {
  try {
    const cartRef = ref(rtdb, SMART_TROLLEY_PATH);
    await set(cartRef, {
      totalPrice: '0'
    });
    return true;
  } catch (error) {
    console.error("Error clearing cart:", error);
    return false;
  }
};

// Function to update total price in the cart
export const updateCartTotalPrice = async (totalPrice: number) => {
  try {
    const totalPriceRef = ref(rtdb, `${SMART_TROLLEY_PATH}/totalPrice`);
    await set(totalPriceRef, totalPrice.toString());
    return true;
  } catch (error) {
    console.error("Error updating total price:", error);
    return false;
  }
};
