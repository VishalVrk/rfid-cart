
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
  const { totalPrice, items } = useCart();
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
    toast.info("Payment is currently disabled. Focus on testing the cart functionality.");
  };

  return (
    <Button
      onClick={handlePayment}
      className={cn(
        "relative overflow-hidden bg-gray-400 hover:bg-gray-500 text-white font-medium py-3 px-6 rounded-lg shadow-md transition-all duration-300",
        className
      )}
    >
      <div className="flex items-center justify-center space-x-2">
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
        <span>Payment Disabled</span>
      </div>
    </Button>
  );
};

export default GooglePayButton;
