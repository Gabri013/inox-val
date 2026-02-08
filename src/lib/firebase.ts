/**
 * ============================================================================
 * CONFIGURAÇÃO FIREBASE
 * ============================================================================
 * 
 * Arquivo central de configuração do Firebase para o ERP Industrial.
 * 
 * SETUP:
 * 1. Criar projeto no Firebase Console (https://console.firebase.google.com)
 * 2. Ativar Authentication (Email/Senha)
 * 3. Ativar Firestore Database
 * 4. Copiar as credenciais para o arquivo .env
 * 5. Configurar Firestore Security Rules (ver FIREBASE_SETUP.md)
 * 
 * VARIÁVEIS DE AMBIENTE NECESSÁRIAS (.env):
 * - VITE_FIREBASE_API_KEY
 * - VITE_FIREBASE_AUTH_DOMAIN
 * - VITE_FIREBASE_PROJECT_ID
 * - VITE_FIREBASE_STORAGE_BUCKET
 * - VITE_FIREBASE_MESSAGING_SENDER_ID
 * - VITE_FIREBASE_APP_ID
 * 
 * ============================================================================
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { 
    initializeAuth,
  browserLocalPersistence,
  type Auth,
  connectAuthEmulator 
} from 'firebase/auth';
import {
  type Firestore,
  connectFirestoreEmulator,
    initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import type { FirebaseConfig } from '@/types/firebase';

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// ============================================================================
// VALIDAÇÃO
// ============================================================================

function validateFirebaseConfig(config: FirebaseConfig): boolean {
  const requiredFields: (keyof FirebaseConfig)[] = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  for (const field of requiredFields) {
    if (!config[field]) {
      console.error(`❌ Firebase: Variável ${field} não configurada`);
      return false;
    }
  }

  return true;
}

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let isInitialized = false;
let cachedEmpresaId: string | null = null;

/**
 * Inicializa o Firebase (chamado automaticamente na primeira importação)
 */
export function initializeFirebase(): { app: FirebaseApp | null; auth: Auth | null; db: Firestore | null } {
  if (isInitialized && app && auth && db) {
    return { app, auth, db };
  }

  // Validar configuração
  if (!validateFirebaseConfig(firebaseConfig)) {
    console.warn('⚠️ Firebase não configurado. Sistema funcionará em modo local sem autenticação.');
    console.warn('💡 Para usar Firebase, crie um arquivo .env com as variáveis VITE_FIREBASE_*');
    console.warn('📖 Consulte .env.example ou SETUP_FIREBASE_RAPIDO.md para instruções');
    isInitialized = true;
    return { app: null, auth: null, db: null };
  }

  try {
    // Inicializar Firebase
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, {
      persistence: browserLocalPersistence,
    });
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });

    // Configurar emuladores (apenas em desenvolvimento)
    if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
      console.log('🔧 Usando Firebase Emulators');
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, 'localhost', 8080);
    }

    isInitialized = true;
    console.log('✅ Firebase inicializado com sucesso');

    return { app, auth, db };
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    throw error;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Obtém a instância do Firebase App
 */
export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    const initialized = initializeFirebase();
    return initialized.app!;
  }
  return app;
}

/**
 * Obtém a instância do Firebase Auth
 */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    const initialized = initializeFirebase();
    return initialized.auth!;
  }
  return auth;
}

/**
 * Obtém a instância do Firestore
 */
export function getFirestore(): Firestore {
  if (!db) {
    const initialized = initializeFirebase();
    return initialized.db!;
  }
  return db;
}

/**
 * Verifica se o Firebase está configurado
 */
export function isFirebaseConfigured(): boolean {
  return validateFirebaseConfig(firebaseConfig);
}

/**
 * Define o contexto de empresa atual (empresaId)
 */
export function setEmpresaContext(empresaId: string | null) {
  cachedEmpresaId = empresaId;
}

/**
 * Obtém o contexto de empresa atual (empresaId)
 */
export function getEmpresaContext(): { empresaId: string | null } {
  const currentAuth = getFirebaseAuth();
  const user = currentAuth.currentUser;
  const fallbackId = user ? user.uid : null;
  return {
    empresaId: cachedEmpresaId ?? fallbackId,
  };
}

/**
 * Obtém o empresaId do usuário atual
 * Em produção, usa o UID do usuário autenticado como fallback
 */
export function getCurrentEmpresaId(): string | null {
  return getEmpresaContext().empresaId;
}

// ============================================================================
// AUTO-INICIALIZAÇÃO (opcional - descomente se quiser inicializar ao importar)
// ============================================================================

// try {
//   initializeFirebase();
// } catch (error) {
//   console.warn('Firebase não inicializado automaticamente:', error);
// }
