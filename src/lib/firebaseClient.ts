'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'; // Add Config

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializa Firebase solo una vez.
// --- CAMBIO AQUÍ ---
// Solo inicializamos con la config real si tenemos la API Key (estamos en runtime)
// Si no, inicializamos con una config vacía para que el Build no explote.
let app: FirebaseApp;

if (!getApps().length) {
  if (!firebaseConfig.apiKey && process.env.NODE_ENV === 'production') {
    // Estamos en fase de Build en la nube
    app = initializeApp({ apiKey: "build-placeholder", projectId: "build-placeholder" });
  } else {
    app = initializeApp(firebaseConfig);
  }
} else {
  app = getApp();
}
// --- FIN DEL CAMBIO ---

const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app, "us-central1"); // Initialize functions

// Connect to emulators if in development
if (process.env.NODE_ENV === 'development') {
  console.log("🔥 Connecting to Firebase Emulators...");
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(firestore, "localhost", 8080);
  connectFunctionsEmulator(functions, "localhost", 5001);
  connectStorageEmulator(storage, "localhost", 9199); // If storage emulator is enabled
}

export { app as firebaseApp, auth, firestore, storage, functions };
