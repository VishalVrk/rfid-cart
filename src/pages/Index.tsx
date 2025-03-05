import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { fetchProducts } from '@/services/productService';
import PaymentStatus from '@/components/PaymentStatus';

const Index = () => {
  const location = useLocation();
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [showPaymentStatus, setShowPaymentStatus] = useState(false);

  useEffect(() => {
    // Check if we have a payment ID in the location state (redirected from cart)
    if (location.state && location.state.paymentId) {
      setPaymentId(location.state.paymentId);
      setShowPaymentStatus(true);
      
      // Clear the state after 1 minute
      const timer = setTimeout(() => {
        setShowPaymentStatus(false);
      }, 60000);
      
      return () => clearTimeout(timer);
    }
  }, [location]);

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });

  const handlePaymentComplete = () => {
    // After successful payment, we can keep the status visible for a bit longer
    setTimeout(() => {
      setShowPaymentStatus(false);
    }, 5000);
  };

  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    const category = product.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  // Sort categories alphabetically
  const sortedCategories = Object.keys(productsByCategory).sort();

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> Failed to load products. Please try again later.</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {showPaymentStatus && paymentId && (
          <div className="mb-8">
            <PaymentStatus paymentId={paymentId} onComplete={handlePaymentComplete} />
          </div>
        )}

        <h1 className="text-3xl font-bold mb-8">Latest Products</h1>
        
        {sortedCategories.map((category) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">{category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productsByCategory[category].map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products available at the moment.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
