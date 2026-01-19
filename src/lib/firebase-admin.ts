// lib/firebase-admin.ts
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App;

// Force Emulators in Development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Using Firebase Emulators for Admin SDK');
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
}

if (getApps().length === 0) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  console.log('🔧 Inicializando Firebase Admin SDK...');
  console.log('🔧 Project ID:', projectId);
  console.log('🔧 Client Email:', clientEmail);
  console.log('🔧 Private Key existe:', !!privateKey);

  if (process.env.NODE_ENV === 'development') {
    // Fix: Emulators might force FIREBASE_PROJECT_ID to 'demo-project', but we need the real one for token verification
    // if the client is using the real one.
    let envProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (envProjectId === 'demo-project') envProjectId = undefined;

    const effectiveProjectId = envProjectId || 'studio-1586082244-c9f9c';
    adminApp = initializeApp({
      projectId: effectiveProjectId,
    });
    console.log(`✅ Firebase Admin SDK inicializado en modo DESARROLLO (PID: ${effectiveProjectId})`);
  } else {
    // Production: Validate variables
    // Production: Validate variables
    if (!projectId || !clientEmail || !privateKey) {
      console.warn('⚠️ Firebase Admin SDK: Missing credentials. Initializing with placeholder for build.');
      adminApp = initializeApp({ projectId: 'build-placeholder' });
    } else {
      try {
        adminApp = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
        });
        console.log('✅ Firebase Admin SDK inicializado correctamente (PRODUCCIÓN)');
      } catch (error: any) {
        console.warn('⚠️ Firebase Admin SDK: Error de credenciales (ignorable en build).', error.message);
        // Fallback for build time where env vars might be dummy values
        if (getApps().length === 0) {
          adminApp = initializeApp({ projectId: 'build-placeholder' });
        } else {
          adminApp = getApps()[0]!;
        }
      }
    }
  }
} else {
  adminApp = getApps()[0]!;
}

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

export const getAdminAuth = () => adminAuth;
export const getAdminDb = () => adminDb;

