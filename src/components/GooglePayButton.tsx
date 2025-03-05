
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';

interface GooglePayButtonProps {
  className?: string;
  recipientUpi?: string;
}

const GooglePayButton: React.FC<GooglePayButtonProps> = ({ 
  className,
  recipientUpi = "vishalvrk97@okhdfcbank" 
}) => {
  const { totalPrice, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = () => {
    setIsLoading(true);
    
    // Construct UPI payment URL
    const amount = totalPrice.toFixed(2);
    const transactionNote = "Payment for Cartopia order";
    const merchantName = "Cartopia";
    
    // Create UPI payment URI
    const upiUrl = `upi://pay?pa=${recipientUpi}&pn=${merchantName}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    
    // Create Google Pay deep link
    const gpayUrl = `https://pay.google.com/gp/v/send?pa=${recipientUpi}&pn=${merchantName}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    
    // For mobile devices, try to open the Google Pay app
    // For desktop, show a QR code or instructions
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = gpayUrl;
      
      // Reset loading after a delay
      setTimeout(() => {
        setIsLoading(false);
        toast.info("Payment initiated. Please complete the transaction in Google Pay.");
      }, 1000);
    } else {
      // For desktop users, provide UPI ID and instructions
      navigator.clipboard.writeText(recipientUpi).then(() => {
        toast.success("UPI ID copied to clipboard: " + recipientUpi);
        toast.info("Please use any UPI app to complete the payment of ₹" + amount);
        setIsLoading(false);
      });
    }
    
    // Simulate successful payment after a delay (in a real app, you'd wait for a webhook callback)
    setTimeout(() => {
      toast.success("Payment successful! Thank you for your order.");
      clearCart();
    }, 5000);
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
