import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBQN5n2OMYfdDRxtCGZpaHvvX_VjjbRkFo",
  authDomain: "stressmonitor-a87cb.firebaseapp.com",
  databaseURL: "https://stressmonitor-a87cb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stressmonitor-a87cb",
  storageBucket: "stressmonitor-a87cb.firebasestorage.app",
  messagingSenderId: "235989933147",
  appId: "1:235989933147:web:fa275aefb4d1c5e7ef337e",
  measurementId: "G-5X2S8TLKEH"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const firestore = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
