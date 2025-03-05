
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCP_1TLZsGjGYHsS2me-2p0Fn1sOS4GOw8",
  authDomain: "bulkprojec.firebaseapp.com",
  databaseURL: "https://bulkprojec-default-rtdb.firebaseio.com",
  projectId: "bulkprojec",
  storageBucket: "bulkprojec.firebasestorage.app",
  messagingSenderId: "925789645395",
  appId: "1:925789645395:web:db14801943ab7fb02034a6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const rtdb = getDatabase(app);

export { app, db, auth, rtdb };
