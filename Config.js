import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAD2tCrZwxVQ8TeyZ06RJSdWDN4aYie1_o",
  authDomain: "alfallah-93c82.firebaseapp.com",
  projectId: "alfallah-93c82",
  storageBucket: "alfallah-93c82.appspot.com",
  messagingSenderId: "387253770174",
  appId: "1:387253770174:web:dcc5e807694c26db3d4bef",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export {
  db,
  auth,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
};
