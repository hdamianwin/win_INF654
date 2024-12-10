import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

export const firebaseConfig = {
    apiKey: "AIzaSyBeLs8C71yppR-edSE2tJuhNEU5M4rEtkU",
    authDomain: "microlearning-8f128.firebaseapp.com",
    projectId: "microlearning-8f128",
    storageBucket: "microlearning-8f128.firebasestorage.app",
    messagingSenderId: "879235145309",
    appId: "1:879235145309:web:076919bd69917326d3b7b4",
    measurementId: "G-EYXKJXHH35"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {db, auth};