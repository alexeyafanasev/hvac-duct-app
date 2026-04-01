import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDjtHzCcj51GOVk_u_3ELD70nIyRSyDLg8",
  authDomain: "hvac-duct-app.firebaseapp.com",
  projectId: "hvac-duct-app",
  storageBucket: "hvac-duct-app.firebasestorage.app",
  messagingSenderId: "273144382001",
  appId: "1:273144382001:web:e7b0b7d9bf5295e5df0b10"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
