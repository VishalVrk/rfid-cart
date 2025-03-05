
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducts, Product } from '@/services/productService';
import { useCart } from '@/contexts/CartContext';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Check, ShoppingCart, RefreshCw } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export default function Index() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const { items, syncWithRtdb, rtdbSynced, totalItems } = useCart();

  // Sync products with RTDB when products are loaded
  useEffect(() => {
    if (products && products.length > 0) {
      // When products are loaded, provide them to the cart context
      // The cart context will handle syncing when RTDB data changes
      syncWithRtdb(products, {});
    }
  }, [products, syncWithRtdb]);

  if (error) {
    toast.error('Failed to load products');
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="container mx-auto px-4 pt-20 pb-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Smart Trolley Shop
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl">
              Add products to your cart or scan items using RFID tags. Your cart will be updated automatically.
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Badge variant={rtdbSynced ? "success" : "outline"} className="flex items-center gap-1">
              {rtdbSynced ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Synced with RFID</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Waiting for RFID data</span>
                </>
              )}
            </Badge>

            <Link to="/cart">
              <Button variant="outline" className="relative">
                <ShoppingCart className="h-4 w-4 mr-2" />
                <span>Cart</span>
                {totalItems > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 max-w-full">
            <Input
              placeholder="Search products..."
              className="max-w-md"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, index) => (
              <div key={index} className="h-[350px] rounded-xl overflow-hidden">
                <Skeleton className="h-full w-full" />
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">No products found</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Try checking back later or contact the administrator</p>
          </div>
        )}
      </main>
    </div>
  );
}
