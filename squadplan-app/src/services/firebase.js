import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: "squadplan.firebaseapp.com",
    projectId: "squadplan",
    storageBucket: "squadplan.firebasestorage.app",
    messagingSenderId: "368022786735",
    appId: "1:368022786735:web:0d6d57bba81da99aa37a5a",
    measurementId: "G-RDZQ95MR8R"
  };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;