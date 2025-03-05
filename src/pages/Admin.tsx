
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PlusCircle, Trash2, Save, Ban, Edit, Check } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product, fetchProducts, addProduct, deleteProduct } from '@/services/productService';
import { getPaymentAccounts, addPaymentAccount, deletePaymentAccount, PaymentAccount } from '@/services/paymentService';
import PaymentManagement from '@/components/PaymentManagement';

const Admin = () => {
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    description: '',
    imageUrl: '',
    category: '',
    rating: 4.0,
    stock: 10,
  });
  
  const [newPaymentAccount, setNewPaymentAccount] = useState<Omit<PaymentAccount, 'id'>>({
    name: '',
    upiId: '',
    isDefault: false
  });

  // Fetch products
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });
  
  // Fetch payment accounts
  const { data: paymentAccounts = [], isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['paymentAccounts'],
    queryFn: getPaymentAccounts
  });

  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: addProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product added successfully');
      resetProductForm();
    },
    onError: (error) => {
      toast.error(`Failed to add product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  // Add payment account mutation
  const addPaymentAccountMutation = useMutation({
    mutationFn: addPaymentAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentAccounts'] });
      toast.success('Payment account added successfully');
      resetAccountForm();
    },
    onError: (error) => {
      toast.error(`Failed to add payment account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  // Delete payment account mutation
  const deletePaymentAccountMutation = useMutation({
    mutationFn: deletePaymentAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentAccounts'] });
      toast.success('Payment account deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete payment account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'rating' || name === 'stock' 
        ? parseFloat(value) 
        : value
    }));
  };
  
  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewPaymentAccount(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    addProductMutation.mutate(newProduct);
  };
  
  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    addPaymentAccountMutation.mutate(newPaymentAccount);
  };

  const resetProductForm = () => {
    setNewProduct({
      name: '',
      price: 0,
      description: '',
      imageUrl: '',
      category: '',
      rating: 4.0,
      stock: 10,
    });
  };
  
  const resetAccountForm = () => {
    setNewPaymentAccount({
      name: '',
      upiId: '',
      isDefault: false
    });
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={toggleEditMode} variant={editMode ? "destructive" : "outline"}>
            {editMode ? (
              <>
                <Ban className="mr-2 h-4 w-4" />
                Exit Edit Mode
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Enter Edit Mode
              </>
            )}
          </Button>
        </div>

        {/* Payment Management Section */}
        <div className="mb-8">
          <PaymentManagement />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Management Section */}
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProduct} className="space-y-4 mb-6">
                <h3 className="text-lg font-medium">Add New Product</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <Input
                      name="name"
                      value={newProduct.name}
                      onChange={handleProductChange}
                      placeholder="Product name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Price</label>
                    <Input
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newProduct.price}
                      onChange={handleProductChange}
                      placeholder="Price"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <Input
                      name="category"
                      value={newProduct.category}
                      onChange={handleProductChange}
                      placeholder="Category"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Stock</label>
                    <Input
                      name="stock"
                      type="number"
                      min="0"
                      step="1"
                      value={newProduct.stock}
                      onChange={handleProductChange}
                      placeholder="Stock quantity"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rating</label>
                    <Input
                      name="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={newProduct.rating}
                      onChange={handleProductChange}
                      placeholder="Rating (0-5)"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Image URL</label>
                    <Input
                      name="imageUrl"
                      value={newProduct.imageUrl}
                      onChange={handleProductChange}
                      placeholder="Image URL"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Input
                      name="description"
                      value={newProduct.description}
                      onChange={handleProductChange}
                      placeholder="Product description"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full mt-4" disabled={addProductMutation.isPending}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </form>

              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Existing Products</h3>
                <div className="overflow-auto max-h-[400px] border rounded-md">
                  {isLoadingProducts ? (
                    <div className="p-4 text-center">Loading products...</div>
                  ) : products.length === 0 ? (
                    <div className="p-4 text-center">No products found</div>
                  ) : (
                    <table className="min-w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                          {editMode && <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {products.map((product) => (
                          <tr key={product.id}>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <img 
                                    className="h-10 w-10 rounded-md object-cover" 
                                    src={product.imageUrl} 
                                    alt={product.name} 
                                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/40')}
                                  />
                                </div>
                                <div className="ml-3">
                                  <p className="font-medium">{product.name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{product.category}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">₹{product.price.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{product.stock}</td>
                            {editMode && (
                              <td className="px-4 py-3 text-sm text-right">
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  onClick={() => deleteProductMutation.mutate(product.id)}
                                  disabled={deleteProductMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Accounts Section */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddAccount} className="space-y-4 mb-6">
                <h3 className="text-lg font-medium">Add Payment Account</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Account Name</label>
                    <Input
                      name="name"
                      value={newPaymentAccount.name}
                      onChange={handleAccountChange}
                      placeholder="Account name (e.g. Business Account)"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">UPI ID</label>
                    <Input
                      name="upiId"
                      value={newPaymentAccount.upiId}
                      onChange={handleAccountChange}
                      placeholder="UPI ID (e.g. username@bank)"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      name="isDefault"
                      checked={newPaymentAccount.isDefault}
                      onChange={handleAccountChange}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="isDefault" className="text-sm font-medium">
                      Set as default payment account
                    </label>
                  </div>
                </div>
                <Button type="submit" className="w-full mt-4" disabled={addPaymentAccountMutation.isPending}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Payment Account
                </Button>
              </form>

              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Existing Payment Accounts</h3>
                <div className="overflow-auto max-h-[300px] border rounded-md">
                  {isLoadingAccounts ? (
                    <div className="p-4 text-center">Loading accounts...</div>
                  ) : paymentAccounts.length === 0 ? (
                    <div className="p-4 text-center">No payment accounts found</div>
                  ) : (
                    <table className="min-w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Account</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">UPI ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Default</th>
                          {editMode && <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {paymentAccounts.map((account) => (
                          <tr key={account.id}>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{account.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{account.upiId}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {account.isDefault && <Check className="h-4 w-4 text-green-500" />}
                            </td>
                            {editMode && (
                              <td className="px-4 py-3 text-sm text-right">
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  onClick={() => deletePaymentAccountMutation.mutate(account.id)}
                                  disabled={deletePaymentAccountMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
