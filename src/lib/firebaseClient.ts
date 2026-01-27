import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;

if (!getApps().length) {
  if (!firebaseConfig.apiKey && process.env.NODE_ENV === 'production') {
    app = initializeApp({ apiKey: "build-placeholder", projectId: "build-placeholder" });
  } else {
    app = initializeApp(firebaseConfig);
  }
} else {
  app = getApp();
}

const auth = getAuth(app);
const firestore = getFirestore(app);
const db = firestore; // Alias estándar para el servidor
const storage = getStorage(app);
const functions = getFunctions(app, "us-central1");

if (process.env.NODE_ENV === 'development') {
  // Solo intentamos conectar emuladores si estamos en el cliente (browser)
  if (typeof window !== 'undefined') {
    console.log("🔥 Connecting to Firebase Emulators...");
    connectAuthEmulator(auth, "http://localhost:9099");
    connectFirestoreEmulator(firestore, "localhost", 8080);
    connectFunctionsEmulator(functions, "localhost", 5001);
    connectStorageEmulator(storage, "localhost", 9199);
  }
}

export { app as firebaseApp, auth, firestore, db, storage, functions };