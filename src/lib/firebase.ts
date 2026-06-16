// Inicialización de Firebase (modular SDK v9+)
// Nota: instala la dependencia con `npm install firebase` antes de usar.
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: (import.meta.env.PUBLIC_FIREBASE_API_KEY ?? undefined) as string | undefined,
  authDomain: (import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN ?? `${import.meta.env.PUBLIC_FIREBASE_PROJECT_ID ?? ''}.firebaseapp.com`) as string | undefined,
  projectId: (import.meta.env.PUBLIC_FIREBASE_PROJECT_ID ?? undefined) as string | undefined,
  appId: (import.meta.env.PUBLIC_FIREBASE_APP_ID ?? undefined) as string | undefined,
  storageBucket: (import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET ?? `${import.meta.env.PUBLIC_FIREBASE_PROJECT_ID ?? ''}.firebasestorage.app`) as string | undefined,
};

function initFirebaseApp() {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

const app = initFirebaseApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

const USER_SETTINGS_COLLECTION = 'sedes_seleccion_user';
const LEGACY_USER_SETTINGS_COLLECTION = 'config_usuarios';
const USERS_COLLECTION = 'usuarios';
const OPERACIONES_COLLECTION = 'cargues_descargues';
const APERTURAS_COLLECTION = 'aperturas_seguridad';
const NOVEDADES_COLLECTION = 'novedades';

export {
  app,
  auth,
  db,
  storage,
  USER_SETTINGS_COLLECTION,
  LEGACY_USER_SETTINGS_COLLECTION,
  USERS_COLLECTION,
  OPERACIONES_COLLECTION,
  APERTURAS_COLLECTION,
  NOVEDADES_COLLECTION,
};
