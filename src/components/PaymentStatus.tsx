
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Payment } from '@/services/paymentService';

interface PaymentStatusProps {
  paymentId: string;
  onComplete?: () => void;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ paymentId, onComplete }) => {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) return;

    setLoading(true);
    
    const paymentRef = doc(db, 'payments', paymentId);
    const unsubscribe = onSnapshot(paymentRef, 
      (doc) => {
        if (doc.exists()) {
          const paymentData = { id: doc.id, ...doc.data() } as Payment;
          setPayment(paymentData);
          setLoading(false);
          
          // If payment is now complete, call the onComplete callback
          if (paymentData.status === 'completed' && onComplete) {
            onComplete();
          }
        } else {
          setError('Payment not found');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching payment status:', err);
        setError('Error fetching payment status');
        setLoading(false);
      }
    );
    
    // Clean up subscription on unmount
    return () => unsubscribe();
  }, [paymentId, onComplete]);

  if (loading) {
    return (
      <Alert className="bg-gray-50 border-gray-200">
        <Clock className="h-4 w-4 text-gray-500" />
        <AlertTitle>Checking payment status...</AlertTitle>
        <AlertDescription>
          Please wait while we check the status of your payment.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!payment) {
    return null;
  }

  if (payment.status === 'pending') {
    return (
      <Alert className="bg-yellow-50 border-yellow-200">
        <Clock className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">Payment Pending</AlertTitle>
        <AlertDescription className="text-yellow-700">
          Your payment is being processed. The admin will confirm it shortly.
        </AlertDescription>
      </Alert>
    );
  }

  if (payment.status === 'completed') {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Payment Successful</AlertTitle>
        <AlertDescription className="text-green-700">
          Your payment has been confirmed. Thank you for your purchase!
        </AlertDescription>
      </Alert>
    );
  }

  if (payment.status === 'failed') {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Payment Failed</AlertTitle>
        <AlertDescription>
          {payment.notes || 'Your payment was not successful. Please try again or contact support.'}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default PaymentStatus;
