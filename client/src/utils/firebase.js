
import { initializeApp } from "firebase/app";
import  {getAuth, GoogleAuthProvider } from "firebase/auth"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "intervai-d8b21.firebaseapp.com",
  projectId: "intervai-d8b21",
  storageBucket: "intervai-d8b21.firebasestorage.app",
  messagingSenderId: "803703243136",
  appId: "1:803703243136:web:f4cc6866b2658de16ac165"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider()

export {auth , provider}