import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-e4ae5.firebaseapp.com",
  projectId: "reactchat-e4ae5",
  storageBucket: "reactchat-e4ae5.firebasestorage.app",
  messagingSenderId: "751881287802",
  appId: "1:751881287802:web:936015feca8da72dbc23c3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()