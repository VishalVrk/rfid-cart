import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Thank you for your purchase. Your order has been processed successfully.
        </p>
        <Link to="/">
          <Button className="px-6">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;