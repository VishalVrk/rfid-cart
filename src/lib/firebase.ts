
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAKjmpwR0ARA9YgmDFL_BM0aP2B62TvUsw",
  authDomain: "rfid-cart.firebaseapp.com",
  projectId: "rfid-cart",
  storageBucket: "rfid-cart.firebasestorage.app",
  messagingSenderId: "986096730912",
  appId: "1:986096730912:web:e8644f7343a2159c338d45",
  measurementId: "G-FGEKX8KSB2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
