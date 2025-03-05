
import { collection, getDocs, doc, getDoc, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  rating: number;
  stock: number;
}

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const productsCollection = collection(db, 'products');
    const productsSnapshot = await getDocs(productsCollection);
    
    return productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Product));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const fetchProductById = async (productId: string): Promise<Product | null> => {
  try {
    const productDoc = doc(db, 'products', productId);
    const productSnapshot = await getDoc(productDoc);
    
    if (productSnapshot.exists()) {
      return {
        id: productSnapshot.id,
        ...productSnapshot.data(),
      } as Product;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching product with ID ${productId}:`, error);
    return null;
  }
};

export const fetchProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const productsCollection = collection(db, 'products');
    const q = query(productsCollection, where('category', '==', category));
    const productsSnapshot = await getDocs(q);
    
    return productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Product));
  } catch (error) {
    console.error(`Error fetching products in category ${category}:`, error);
    return [];
  }
};

// Sample products for development (will be removed in production)
export const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    price: 299.99,
    description: 'High-quality wireless headphones with noise cancellation and premium sound.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop',
    category: 'Electronics',
    rating: 4.8,
    stock: 15
  },
  {
    id: '2',
    name: 'Smartwatch Pro',
    price: 199.99,
    description: 'Advanced smartwatch with health tracking, notifications, and a sleek design.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop',
    category: 'Electronics',
    rating: 4.6,
    stock: 20
  },
  {
    id: '3',
    name: 'Ultra-Slim Laptop',
    price: 1299.99,
    description: 'Powerful yet lightweight laptop perfect for professionals on the go.',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop',
    category: 'Computers',
    rating: 4.9,
    stock: 7
  },
  {
    id: '4',
    name: 'Ergonomic Office Chair',
    price: 249.99,
    description: 'Comfortable office chair designed for long hours of work with proper back support.',
    imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?q=80&w=2070&auto=format&fit=crop',
    category: 'Furniture',
    rating: 4.5,
    stock: 12
  },
  {
    id: '5',
    name: 'Professional Camera Kit',
    price: 799.99,
    description: 'Complete camera kit for photography enthusiasts with lens and accessories.',
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=2070&auto=format&fit=crop',
    category: 'Photography',
    rating: 4.7,
    stock: 5
  },
  {
    id: '6',
    name: 'Designer Watch',
    price: 349.99,
    description: 'Elegant timepiece that combines classic design with modern features.',
    imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1999&auto=format&fit=crop',
    category: 'Fashion',
    rating: 4.4,
    stock: 9
  }
];
