import { create } from 'zustand';
import { doc, onSnapshot } from 'firebase/firestore';
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

let unsubscribeUserDoc: (() => void) | null = null;

const useStore = create<AppState>(() => ({
  user: null,
  initialized: false,
}));

if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, (firebaseUser) => {
    if (unsubscribeUserDoc) {
      unsubscribeUserDoc();
      unsubscribeUserDoc = null;
    }

    if (!firebaseUser) {
      useStore.setState({ user: null, initialized: true });
      return;
    }

    const docRef = doc(db, USERS_COLLECTION, firebaseUser.uid);
    let isFirstSnapshot = true;
    let initialSede: string | undefined;

    unsubscribeUserDoc = onSnapshot(
      docRef,
      (docSnap) => {
        if (!docSnap.exists()) {
          useStore.setState({ user: null, initialized: true });
          return;
        }

        const data = docSnap.data();
        const newSede = data.sede;

        if (isFirstSnapshot) {
          initialSede = newSede;
          isFirstSnapshot = false;
          useStore.setState({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              nombre: data.nombre,
              role: data.role,
              sede: newSede,
              activo: data.activo,
            },
            initialized: true,
          });
        } else {
          if (initialSede && newSede !== initialSede) {
            signOut(auth);
            return;
          }
          useStore.setState({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              nombre: data.nombre,
              role: data.role,
              sede: newSede,
              activo: data.activo,
            },
          });
        }
      },
      (error) => {
        console.error('Error listening to user document', error);
        useStore.setState({ user: null, initialized: true });
      }
    );
  });
}

export default useStore;
