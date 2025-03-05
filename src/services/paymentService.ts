
import { collection, getDocs, doc, getDoc, addDoc, deleteDoc, updateDoc, query, where, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PaymentAccount {
  id: string;
  name: string;
  upiId: string;
  isDefault: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: number;
  updatedAt: number;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  transactionId?: string;
  notes?: string;
}

export const getPaymentAccounts = async (): Promise<PaymentAccount[]> => {
  try {
    const accountsCollection = collection(db, 'paymentAccounts');
    const accountsSnapshot = await getDocs(accountsCollection);
    
    return accountsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as PaymentAccount));
  } catch (error) {
    console.error('Error fetching payment accounts:', error);
    return [];
  }
};

export const getDefaultPaymentAccount = async (): Promise<PaymentAccount | null> => {
  try {
    const accountsCollection = collection(db, 'paymentAccounts');
    const q = query(accountsCollection, where('isDefault', '==', true));
    const accountsSnapshot = await getDocs(q);
    
    if (accountsSnapshot.empty) {
      return null;
    }
    
    const doc = accountsSnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as PaymentAccount;
  } catch (error) {
    console.error('Error fetching default payment account:', error);
    return null;
  }
};

export const addPaymentAccount = async (account: Omit<PaymentAccount, 'id'>): Promise<PaymentAccount> => {
  try {
    const batch = writeBatch(db);
    const accountsCollection = collection(db, 'paymentAccounts');
    
    if (account.isDefault) {
      const defaultAccountsQuery = query(accountsCollection, where('isDefault', '==', true));
      const defaultAccountsSnapshot = await getDocs(defaultAccountsQuery);
      
      defaultAccountsSnapshot.docs.forEach(docSnapshot => {
        batch.update(doc(db, 'paymentAccounts', docSnapshot.id), {
          isDefault: false
        });
      });
    }
    
    const docRef = await addDoc(accountsCollection, account);
    
    await batch.commit();
    
    return {
      id: docRef.id,
      name: account.name,
      upiId: account.upiId,
      isDefault: account.isDefault
    };
  } catch (error) {
    console.error('Error adding payment account:', error);
    throw error;
  }
};

export const updatePaymentAccount = async (accountId: string, updates: Partial<Omit<PaymentAccount, 'id'>>): Promise<void> => {
  try {
    const batch = writeBatch(db);
    const accountsCollection = collection(db, 'paymentAccounts');
    
    if (updates.isDefault) {
      const defaultAccountsQuery = query(accountsCollection, where('isDefault', '==', true));
      const defaultAccountsSnapshot = await getDocs(defaultAccountsQuery);
      
      defaultAccountsSnapshot.docs.forEach(docSnapshot => {
        if (docSnapshot.id !== accountId) {
          batch.update(doc(db, 'paymentAccounts', docSnapshot.id), {
            isDefault: false
          });
        }
      });
    }
    
    batch.update(doc(db, 'paymentAccounts', accountId), updates);
    
    await batch.commit();
  } catch (error) {
    console.error(`Error updating payment account with ID ${accountId}:`, error);
    throw error;
  }
};

export const deletePaymentAccount = async (accountId: string): Promise<void> => {
  try {
    const accountDoc = doc(db, 'paymentAccounts', accountId);
    const accountSnapshot = await getDoc(accountDoc);
    
    if (accountSnapshot.exists() && accountSnapshot.data().isDefault) {
      const accountsCollection = collection(db, 'paymentAccounts');
      const accountsQuery = query(accountsCollection);
      const accountsSnapshot = await getDocs(accountsQuery);
      
      if (accountsSnapshot.size > 1) {
        const anotherAccount = accountsSnapshot.docs.find(doc => doc.id !== accountId);
        if (anotherAccount) {
          await updateDoc(doc(db, 'paymentAccounts', anotherAccount.id), {
            isDefault: true
          });
        }
      }
    }
    
    await deleteDoc(accountDoc);
  } catch (error) {
    console.error(`Error deleting payment account with ID ${accountId}:`, error);
    throw error;
  }
};

export const createPayment = async (payment: Omit<Payment, 'id'>): Promise<Payment> => {
  try {
    const paymentsCollection = collection(db, 'payments');
    const docRef = await addDoc(paymentsCollection, payment);
    
    return {
      id: docRef.id,
      userId: payment.userId,
      amount: payment.amount,
      status: payment.status,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      items: payment.items,
      transactionId: payment.transactionId,
      notes: payment.notes
    };
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

export const getPayments = async (status?: 'pending' | 'completed' | 'failed'): Promise<Payment[]> => {
  try {
    const paymentsCollection = collection(db, 'payments');
    let paymentsQuery;
    
    if (status) {
      paymentsQuery = query(paymentsCollection, where('status', '==', status));
    } else {
      paymentsQuery = query(paymentsCollection);
    }
    
    const paymentsSnapshot = await getDocs(paymentsQuery);
    
    return paymentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Payment));
  } catch (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
};

export const updatePaymentStatus = async (paymentId: string, status: 'pending' | 'completed' | 'failed', notes?: string): Promise<void> => {
  try {
    const paymentDoc = doc(db, 'payments', paymentId);
    await updateDoc(paymentDoc, {
      status,
      updatedAt: Date.now(),
      ...(notes ? { notes } : {})
    });
  } catch (error) {
    console.error(`Error updating payment status for ID ${paymentId}:`, error);
    throw error;
  }
};

export const defaultAccount: PaymentAccount = {
  id: 'default',
  name: 'Default Business Account',
  upiId: 'vishalvrk97@okhdfcbank',
  isDefault: true
};
