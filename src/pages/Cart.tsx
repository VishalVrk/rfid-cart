
import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { MinusCircle, PlusCircle, Trash2, ShoppingCart, ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import GooglePayButton from '@/components/GooglePayButton';
import Navigation from '@/components/Navigation';
import { cn } from '@/lib/utils';

const Cart = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 pt-20 pb-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Products
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight mb-8 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Your Cart {totalItems > 0 && `(${totalItems} ${totalItems === 1 ? 'item' : 'items'})`}
          </h1>
          
          {items.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {items.map((item, index) => (
                  <Card 
                    key={item.id}
                    className={cn(
                      "overflow-hidden border-0 bg-white dark:bg-gray-900 rounded-xl shadow-sm animate-slide-up",
                      "hover:shadow-md transition-all duration-300"
                    )}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center p-4">
                      <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      
                      <div className="ml-4 flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">${item.price.toFixed(2)}</p>
                          </div>
                          
                          <div className="flex items-center mt-2 md:mt-0">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed p-1"
                              aria-label="Decrease quantity"
                            >
                              <MinusCircle className="w-5 h-5" />
                            </button>
                            
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed p-1"
                              aria-label="Increase quantity"
                            >
                              <PlusCircle className="w-5 h-5" />
                            </button>
                            
                            <button
                              onClick={() => removeItem(item.id)}
                              className="ml-4 text-red-500 hover:text-red-700 p-1"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-2 md:flex md:items-center md:justify-between">
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {item.description}
                          </p>
                          <p className="text-sm font-medium mt-1 md:mt-0">
                            Subtotal: ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                
                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCart}
                    className="text-xs text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Clear Cart
                  </Button>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <Card className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border-0 sticky top-24">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                        <span>${totalPrice.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Shipping</span>
                        <span className="text-green-500">Free</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Tax</span>
                        <span>$0.00</span>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-6 pt-0">
                    <div className="w-full space-y-4">
                      <GooglePayButton className="w-full" />
                      
                      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                        Payment will be processed via Google Pay
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-xl shadow-sm animate-fade-in">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-6" />
              <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">Looks like you haven't added any products to your cart yet.</p>
              <Link to="/">
                <Button className="px-6">
                  Browse Products
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Cart;
