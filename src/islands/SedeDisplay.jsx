import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, USER_SETTINGS_COLLECTION } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function SedeDisplay() {
  const [sedeSeleccionada, setSedeSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setSedeSeleccionada(null);
        setCargando(false);
        return;
      }

      try {
        const userDocRef = doc(db, USER_SETTINGS_COLLECTION, currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists() && userDoc.data()?.sedeSeleccionada) {
          setSedeSeleccionada(userDoc.data().sedeSeleccionada);
        }
      } catch (error) {
        console.error('Error cargando sede:', error);
      }
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  // Recargar sede cuando el modal la cambia
  useEffect(() => {
    const handleSedeChange = (event) => {
      // Recibir sede del evento sin hacer lectura extra a Firestore
      if (event.detail?.sede) {
        setSedeSeleccionada(event.detail.sede);
      }
    };

    window.addEventListener('sede-changed', handleSedeChange);
    return () => window.removeEventListener('sede-changed', handleSedeChange);
  }, []);

  if (cargando || !sedeSeleccionada) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg bg-white/40 px-3 py-1.5 text-sm">
      <span className="font-medium text-slate-700">{sedeSeleccionada}</span>
    </div>
  );
}
