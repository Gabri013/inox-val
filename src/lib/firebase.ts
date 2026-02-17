import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  inMemoryPersistence,
  connectAuthEmulator,
  type Auth,
} from "firebase/auth";
import { getFirestore as getFirestoreSdk, connectFirestoreEmulator, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const placeholderConfig = {
  apiKey: "missing-api-key",
  authDomain: "localhost",
  projectId: "missing-project-id",
  storageBucket: "missing-storage-bucket",
  messagingSenderId: "missing-messaging-sender",
  appId: "missing-app-id",
};

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;
let authPersistenceConfigured = false;
let emulatorsConfigured = false;

let empresaContext: { empresaId: string | null } = { empresaId: null };

export function setEmpresaContext(empresaId: string | null) {
  empresaContext = { empresaId };
}

export function getEmpresaContext() {
  return empresaContext;
}

export function isFirebaseConfigured(): boolean {
  return Object.values(firebaseConfig).every(Boolean);
}

function resolveConfig() {
  return isFirebaseConfigured() ? firebaseConfig : placeholderConfig;
}

function getFirebaseApp(): FirebaseApp {
  if (appInstance) {
    return appInstance;
  }

  const apps = getApps();
  appInstance = apps.length > 0 ? apps[0] : initializeApp(resolveConfig());
  return appInstance;
}

function configureAuthPersistence(auth: Auth) {
  if (authPersistenceConfigured) return;
  authPersistenceConfigured = true;

  const enablePersistence = import.meta.env.VITE_FIREBASE_ENABLE_PERSISTENCE !== "false";
  const persistence = enablePersistence ? browserLocalPersistence : inMemoryPersistence;

  setPersistence(auth, persistence).catch(() => {
    // Ignore persistence errors (e.g., disabled in browser settings)
  });
}

function configureEmulators(auth: Auth, db: Firestore) {
  if (emulatorsConfigured) return;
  if (import.meta.env.VITE_USE_FIREBASE_EMULATORS !== "true") return;

  emulatorsConfigured = true;

  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "localhost", 8080);
}

export function getFirebaseAuth(): Auth {
  if (authInstance) {
    return authInstance;
  }

  const app = getFirebaseApp();
  authInstance = getAuth(app);
  configureAuthPersistence(authInstance);

  if (firestoreInstance) {
    configureEmulators(authInstance, firestoreInstance);
  }

  return authInstance;
}

export function getFirestore(): Firestore {
  if (firestoreInstance) {
    return firestoreInstance;
  }

  const app = getFirebaseApp();
  firestoreInstance = getFirestoreSdk(app);

  if (authInstance) {
    configureEmulators(authInstance, firestoreInstance);
  }

  return firestoreInstance;
}

export const db = getFirestore();
