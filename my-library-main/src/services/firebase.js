// src/services/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, addDoc, deleteDoc,
  doc, updateDoc, setDoc, getDoc, onSnapshot, runTransaction, deleteField,
  query, where
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
  getAuth,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updatePassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Cau hinh Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAEz7YxEuP5wwHJwU2yTGtMTr5yPq_R-MY",
  authDomain: "mylibrary-cdb4e.firebaseapp.com",
  projectId: "mylibrary-cdb4e",
  storageBucket: "mylibrary-cdb4e.firebasestorage.app",
  messagingSenderId: "756414177501",
  appId: "1:756414177501:web:9f058366c283d5d74dbb34",
  measurementId: "G-Q4WMGVKW8X"
};

const app = initializeApp(firebaseConfig);
const accountCreationApp = initializeApp(firebaseConfig, "account-creation");
const db = getFirestore(app);
const auth = getAuth(app);
const accountCreationAuth = getAuth(accountCreationApp);

// Collections
const booksCollection = collection(db, "books");
const loansCollection = collection(db, "loans");
const usersCollection = collection(db, "users");

// Day ra window de file khac dung
window.db = db;
window.auth = auth;
window.booksCollection = booksCollection;
window.loansCollection = loansCollection;
window.usersCollection = usersCollection;

// Day cac ham Firestore ra window
window.fs = { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, setDoc, getDoc, onSnapshot, runTransaction, deleteField, query, where };
window.authApi = {
  auth,
  accountCreationAuth,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updatePassword,
  signOut,
  onAuthStateChanged
};
