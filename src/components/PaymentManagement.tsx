
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getPayments, updatePaymentStatus, Payment } from '@/services/paymentService';
import { format } from 'date-fns';

const PaymentManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'failed' | 'all'>('pending');

  // Fetch payments based on active tab
  const { data: payments = [], isLoading, refetch } = useQuery({
    queryKey: ['payments', activeTab],
    queryFn: () => activeTab === 'all' ? getPayments() : getPayments(activeTab as any),
  });

  // Update payment status mutation
  const updatePaymentMutation = useMutation({
    mutationFn: ({ paymentId, status, notes }: { paymentId: string; status: 'completed' | 'failed'; notes?: string }) => 
      updatePaymentStatus(paymentId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Payment status updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update payment status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'pending' | 'completed' | 'failed' | 'all');
  };

  const handleUpdateStatus = (paymentId: string, status: 'completed' | 'failed') => {
    const notes = status === 'completed' 
      ? 'Payment confirmed by admin'
      : 'Payment rejected by admin';
    
    updatePaymentMutation.mutate({ paymentId, status, notes });
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), 'PPp');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Completed</span>;
      case 'failed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Failed</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Payment Management</CardTitle>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No {activeTab !== 'all' ? activeTab : ''} payments found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payments.map((payment: Payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {payment.id.substring(0, 6)}...
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(payment.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          ₹{payment.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {payment.items.length} items
                        </td>
                        <td className="px-4 py-3 text-sm text-right space-x-2">
                          {payment.status === 'pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
                                onClick={() => handleUpdateStatus(payment.id, 'completed')}
                                disabled={updatePaymentMutation.isPending}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
                                onClick={() => handleUpdateStatus(payment.id, 'failed')}
                                disabled={updatePaymentMutation.isPending}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              toast.info(
                                <div>
                                  <p className="font-bold mb-1">Order Details:</p>
                                  <ul className="list-disc pl-4 space-y-1">
                                    {payment.items.map(item => (
                                      <li key={item.id}>{item.name} × {item.quantity} - ₹{(item.price * item.quantity).toFixed(2)}</li>
                                    ))}
                                  </ul>
                                  <p className="mt-2 font-bold">Total: ₹{payment.amount.toFixed(2)}</p>
                                  {payment.notes && (
                                    <p className="mt-2 text-gray-600">Note: {payment.notes}</p>
                                  )}
                                </div>
                              );
                            }}
                          >
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PaymentManagement;
