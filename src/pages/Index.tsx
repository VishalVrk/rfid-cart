import React, { useState, useEffect } from 'react';
import { fetchProducts, sampleProducts, Product } from '@/services/productService';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { Search, Filter, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Navigation from '@/components/Navigation';
import { toast } from '@/components/ui/sonner';

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { addItem } = useCart();
  const isMobile = useIsMobile();

  // Get unique categories
  const categories = [...new Set(products.map(product => product.category))];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Try to fetch from Firebase
        const firebaseProducts = await fetchProducts();
        
        // If we got products from Firebase, use those
        if (firebaseProducts.length > 0) {
          setProducts(firebaseProducts);
          toast.success('Products loaded successfully');
        } else {
          // Otherwise use sample products
          console.log('Using sample products as fallback');
          setProducts(sampleProducts);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        // Use sample products as fallback
        setProducts(sampleProducts);
        toast.error('Failed to load products from database, using sample data');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 pt-20 pb-10">
        <section className="mt-8 md:mt-12 mb-8 text-center max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-3 animate-fade-in">
            Premium Quality Products
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Discover Exceptional Products
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Browse our curated collection of premium items designed to enhance your lifestyle with unparalleled quality and elegance.
          </p>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white dark:bg-gray-900 shadow-sm"
              />
            </div>
            
            {isMobile ? (
              <Button
                variant="outline"
                onClick={() => setSelectedCategory(null)}
                className="flex-shrink-0"
              >
                <Filter className="w-4 h-4 mr-2" />
                {selectedCategory || "All Categories"}
              </Button>
            ) : (
              <div className="flex items-center space-x-2 overflow-x-auto whitespace-nowrap pb-1 scrollbar-none">
                <Button
                  variant={selectedCategory === null ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="flex-shrink-0"
                >
                  All
                </Button>
                
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="flex-shrink-0"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </section>
        
        {/* Mobile Categories */}
        {isMobile && selectedCategory !== null && (
          <ScrollArea className="whitespace-nowrap mb-6">
            <div className="flex space-x-2 p-1">
              <Button
                variant={selectedCategory === null ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="flex-shrink-0"
              >
                All
              </Button>
              
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="flex-shrink-0"
                >
                  {category}
                </Button>
              ))}
            </div>
          </ScrollArea>
        )}
        
        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(6).fill(0).map((_, index) => (
              <div key={index} className="rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse h-72"></div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
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
            <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No products found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter to find what you're looking for.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
