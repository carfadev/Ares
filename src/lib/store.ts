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
          getDoc(docRef).then((fallbackSnap) => {
            if (fallbackSnap.exists()) {
              const data = fallbackSnap.data();
              useStore.setState({
                user: {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email || '',
                  nombre: data.nombre,
                  role: data.role,
                  sede: data.sede,
                  activo: data.activo,
                },
                initialized: true,
              });
            } else {
              useStore.setState({ user: null, initialized: true });
            }
          }).catch(() => {
            useStore.setState({ user: null, initialized: true });
          });
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
        console.error('Error listening to user document, trying direct fetch...', error);
        getDoc(docRef).then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            useStore.setState({
              user: {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                nombre: data.nombre,
                role: data.role,
                sede: data.sede,
                activo: data.activo,
              },
              initialized: true,
            });
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
