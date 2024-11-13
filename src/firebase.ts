import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";  // Importa Firestore

const firebaseConfig = {
  apiKey: "AIzaSyBGBb5vVEcrAJ2m6jm9-ZmX-wxYDTnb8VM",
  authDomain: "prueba-400d4.firebaseapp.com",
  databaseURL: "https://prueba-400d4-default-rtdb.firebaseio.com",
  projectId: "prueba-400d4",
  storageBucket: "prueba-400d4.appspot.com",
  messagingSenderId: "875113542178",
  appId: "1:875113542178:web:b9935a426b016f32c5107b",
  measurementId: "G-M6WKCKHCZM"
};

const app = initializeApp(firebaseConfig);

// Configura Realtime Database
export const db = getDatabase(app);

// Configura Firestore (para las reseñas)
export const firestore = getFirestore(app);

// Configura Firebase Authentication
export const auth = getAuth(app);