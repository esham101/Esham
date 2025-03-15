// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnkMlpEkpcLqz1AELfNzC0_PC664XV63w",
  authDomain: "esham-edb46.firebaseapp.com",
  projectId: "esham-edb46",
  storageBucket: "esham-edb46.firebasestorage.app",
  messagingSenderId: "251181665290",
  appId: "1:251181665290:web:aa9c024148e0d0fb9f23f3",
  measurementId: "G-VMY6FSC9M9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
export { db };