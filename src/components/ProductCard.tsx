
import React from 'react';
import { Product } from '@/services/productService';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Plus, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const { addItem, items } = useCart();
  const isInCart = items.some(item => item.id === product.id);

  const handleAddToCart = () => {
    addItem(product);
  };

  return (
    <Card 
      className={cn(
        "product-card overflow-hidden border-0 bg-white dark:bg-gray-900 rounded-xl shadow-sm h-full",
        className
      )}
    >
      <div className="aspect-square relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        {product.stock < 5 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded z-20">
            Low Stock
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1 z-20">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span>{product.rating}</span>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">
          {product.category}
        </div>
        <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 h-10">
          {product.description}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="text-lg font-semibold">${product.price.toFixed(2)}</div>
        <Button 
          onClick={handleAddToCart}
          variant={isInCart ? "secondary" : "default"}
          size="sm"
          className="btn-hover-effect"
        >
          <Plus className="mr-1 w-4 h-4" />
          {isInCart ? 'Add more' : 'Add to cart'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
