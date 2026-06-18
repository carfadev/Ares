import { create } from 'zustand';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db, USERS_COLLECTION } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  nombre?: string;
  role?: string;
  sede?: string;
  activo?: boolean;
}

interface AppState {
  user: UserProfile | null;
  initialized: boolean;
}

const CACHE_KEY = 'ares_user_profile';

function loadCache(): UserProfile | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

function saveCache(user: UserProfile) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      uid: user.uid,
      email: user.email,
      nombre: user.nombre,
      role: user.role,
      sede: user.sede,
      activo: user.activo,
    }));
  } catch {}
}

function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {}
}

let unsubscribeUserDoc: (() => void) | null = null;

const cached = typeof window !== 'undefined' ? loadCache() : null;

const useStore = create<AppState>(() => ({
  user: cached,
  initialized: !!cached,
}));

if (typeof window !== 'undefined') {
  setTimeout(() => {
    useStore.setState((s) => (s.initialized ? {} : { initialized: true }));
  }, 15000);

  onAuthStateChanged(auth, (firebaseUser) => {
    if (unsubscribeUserDoc) {
      unsubscribeUserDoc();
      unsubscribeUserDoc = null;
    }

    if (!firebaseUser) {
      clearCache();
      useStore.setState({ user: null, initialized: false });
      return;
    }

    const currentUser = useStore.getState().user;

    if (!currentUser || currentUser.uid !== firebaseUser.uid || !currentUser.nombre) {
      useStore.setState({
        user: {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
        },
        initialized: false,
      });
    }

    const docRef = doc(db, USERS_COLLECTION, firebaseUser.uid);
    let isFirstSnapshot = true;
    let initialSede: string | undefined;

    const actualizarUsuario = (data: Record<string, unknown>) => {
      const userData: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        nombre: data.nombre as string | undefined,
        role: data.role as string | undefined,
        sede: data.sede as string | undefined,
        activo: data.activo as boolean | undefined,
      };
      saveCache(userData);
      useStore.setState({ user: userData, initialized: true });
    };

    unsubscribeUserDoc = onSnapshot(
      docRef,
      (docSnap) => {
        if (!docSnap.exists()) {
          getDoc(docRef).then((fallbackSnap) => {
            if (fallbackSnap.exists()) {
              actualizarUsuario(fallbackSnap.data());
            } else {
              useStore.setState({ user: null, initialized: true });
            }
          }).catch(() => {
            useStore.setState({ user: null, initialized: true });
          });
          return;
        }

        const data = docSnap.data();
        const newSede = data.sede as string | undefined;

        if (isFirstSnapshot) {
          initialSede = newSede;
          isFirstSnapshot = false;
          actualizarUsuario(data);
        } else {
          if (initialSede && newSede !== initialSede) {
            signOut(auth);
            return;
          }
          if (data.nombre || data.sede || data.role) {
            actualizarUsuario(data);
          }
        }
      },
      (error) => {
        console.error('Error listening to user document, trying direct fetch...', error);
        getDoc(docRef).then((docSnap) => {
          if (docSnap.exists()) {
            actualizarUsuario(docSnap.data());
          } else {
            useStore.setState({ user: null, initialized: true });
          }
        }).catch((fallbackError) => {
          console.error('Fallback direct fetch also failed', fallbackError);
          useStore.setState({ user: null, initialized: true });
        });
      }
    );
  });
}

export default useStore;
