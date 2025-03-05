
import { collection, getDocs, doc, getDoc, addDoc, deleteDoc, updateDoc, query, where, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PaymentAccount {
  id: string;
  name: string;
  upiId: string;
  isDefault: boolean;
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
    
    // If this account is being set as default, unset any existing default accounts
    if (account.isDefault) {
      const defaultAccountsQuery = query(accountsCollection, where('isDefault', '==', true));
      const defaultAccountsSnapshot = await getDocs(defaultAccountsQuery);
      
      defaultAccountsSnapshot.docs.forEach(docSnapshot => {
        batch.update(doc(db, 'paymentAccounts', docSnapshot.id), {
          isDefault: false
        });
      });
    }
    
    // Add the new account
    const docRef = await addDoc(accountsCollection, account);
    
    // Commit the batch
    await batch.commit();
    
    return {
      id: docRef.id,
      ...account
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
    
    // If this account is being set as default, unset any existing default accounts
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
    
    // Update the account
    batch.update(doc(db, 'paymentAccounts', accountId), updates);
    
    // Commit the batch
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
      // If deleting a default account, try to set another account as default
      const accountsCollection = collection(db, 'paymentAccounts');
      const accountsQuery = query(accountsCollection);
      const accountsSnapshot = await getDocs(accountsQuery);
      
      if (accountsSnapshot.size > 1) {
        // Find another account that is not the one being deleted
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

// Default account for development (will be removed in production)
export const defaultAccount: PaymentAccount = {
  id: 'default',
  name: 'Default Business Account',
  upiId: 'vishalvrk97@okhdfcbank',
  isDefault: true
};
