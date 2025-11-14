import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAOM3nYKJehOFnYj0IL9RZJBKfVox5Zr5s",
  authDomain: "efootball-kabir.firebaseapp.com",
  projectId: "efootball-kabir",
  storageBucket: "efootball-kabir.firebasestorage.app",
  messagingSenderId: "179529858839",
  appId: "1:179529858839:web:c08efd8bc5cfccae860152",
  measurementId: "G-74SCPJ4D9N"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);