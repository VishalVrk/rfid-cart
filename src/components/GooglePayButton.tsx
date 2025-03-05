
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { createPayment, getDefaultPaymentAccount } from '@/services/paymentService';
import { useNavigate } from 'react-router-dom';

interface GooglePayButtonProps {
  className?: string;
  recipientUpi?: string;
}

const GooglePayButton: React.FC<GooglePayButtonProps> = ({ 
  className,
  recipientUpi
}) => {
  const { totalPrice, items, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [defaultUpi, setDefaultUpi] = useState(recipientUpi || "vishalvrk97@okhdfcbank");
  const navigate = useNavigate();
  
  // Fetch default UPI ID if not provided
  useEffect(() => {
    if (!recipientUpi) {
      const fetchDefaultAccount = async () => {
        try {
          const defaultAccount = await getDefaultPaymentAccount();
          if (defaultAccount) {
            setDefaultUpi(defaultAccount.upiId);
          }
        } catch (error) {
          console.error("Error fetching default payment account:", error);
        }
      };
      
      fetchDefaultAccount();
    }
  }, [recipientUpi]);

  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      // Create a payment record in Firebase
      const paymentData = {
        userId: 'anonymous', // Replace with actual user ID if authentication is implemented
        amount: totalPrice,
        status: 'pending' as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        transactionId: `TX${Date.now()}${Math.floor(Math.random() * 1000)}`
      };
      
      const payment = await createPayment(paymentData);
      
      // Construct UPI payment URL
      const amount = totalPrice.toFixed(2);
      const transactionNote = `Payment for Cartopia order #${payment.id}`;
      const merchantName = "Cartopia";
      
      // Create UPI payment URI
      const upiUrl = `upi://pay?pa=${defaultUpi}&pn=${encodeURIComponent(merchantName)}&mc=0000&tid=${payment.transactionId}&tr=${payment.id}&tn=${encodeURIComponent(transactionNote)}&am=${amount}&cu=INR`;
      
      // Create Google Pay deep link
      const gpayUrl = `https://pay.google.com/gp/v/send?pa=${defaultUpi}&pn=${merchantName}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
      
      // For mobile devices, try to open the Google Pay app
      // For desktop, show a QR code or instructions
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.location.href = upiUrl;
        
        // Reset loading after a delay
        setTimeout(() => {
          setIsLoading(false);
          toast.info("Payment initiated. Please complete the transaction in Google Pay.");
        }, 1000);
      } else {
        // For desktop users, provide UPI ID and instructions
        navigator.clipboard.writeText(defaultUpi).then(() => {
          toast.success("UPI ID copied to clipboard: " + defaultUpi);
          toast.info("Please use any UPI app to complete the payment of ₹" + amount);
          setIsLoading(false);
        });
      }
      
      // Notify user to wait for payment confirmation
      toast.info("Your payment will be confirmed by the admin shortly.");
      
      // Clear cart and redirect to home page after a delay
      setTimeout(() => {
        clearCart();
        navigate('/', { state: { paymentId: payment.id } });
      }, 5000);
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error("Failed to initiate payment. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      className={cn(
        "relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 px-6 rounded-lg shadow-md transition-all duration-300",
        className
      )}
      disabled={isLoading}
    >
      <div className="flex items-center justify-center space-x-2">
        {isLoading ? (
          <div className="animate-pulse">Processing...</div>
        ) : (
          <>
            <svg 
              className="w-5 h-5" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M5 10V14C5 17.866 8.13401 21 12 21C15.866 21 19 17.866 19 14V10M5 10V6C5 4.34315 6.34315 3 8 3H16C17.6569 3 19 4.34315 19 6V10M5 10H19" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            <span>Pay with Google Pay</span>
          </>
        )}
      </div>
    </Button>
  );
};

export default GooglePayButton;
