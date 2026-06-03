// Inicialización de Firebase (modular SDK v9+)
// Nota: instala la dependencia con `npm install firebase` antes de usar.
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: (import.meta.env.PUBLIC_FIREBASE_API_KEY ?? undefined) as string | undefined,
  authDomain: (import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN ?? `${import.meta.env.PUBLIC_FIREBASE_PROJECT_ID ?? ''}.firebaseapp.com`) as string | undefined,
  projectId: (import.meta.env.PUBLIC_FIREBASE_PROJECT_ID ?? undefined) as string | undefined,
  appId: (import.meta.env.PUBLIC_FIREBASE_APP_ID ?? undefined) as string | undefined,
};

function initFirebaseApp() {
  // Evita inicializar más de una vez (SSR + cliente)
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

const app = initFirebaseApp();
const db = getFirestore(app);
const auth = getAuth(app);

const USER_SETTINGS_COLLECTION = 'config_usuarios';
const LEGACY_USER_SETTINGS_COLLECTION = 'usuarios';

export { app, auth, db, USER_SETTINGS_COLLECTION, LEGACY_USER_SETTINGS_COLLECTION };
