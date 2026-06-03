import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, USER_SETTINGS_COLLECTION, LEGACY_USER_SETTINGS_COLLECTION } from '../lib/firebase';
import { getSedes } from '../data/sedes';

export default function SedeSelectionModal() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [sedeSeleccionada, setSedeSeleccionadaState] = useState(null);
  const [cargando, setCargando] = useState(true);
  const sedes = getSedes();

  // Estilos consistentes con el proyecto
  const actionBase = 'inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 w-full';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, USER_SETTINGS_COLLECTION, user.uid);
          const legacyUserDocRef = doc(db, LEGACY_USER_SETTINGS_COLLECTION, user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists() && userDoc.data().sedeSeleccionada) {
            setSedeSeleccionadaState(userDoc.data().sedeSeleccionada);
            setMostrarModal(false);
          } else {
            const legacyUserDoc = await getDoc(legacyUserDocRef);

            if (legacyUserDoc.exists() && legacyUserDoc.data().sedeSeleccionada) {
              const legacyData = legacyUserDoc.data();
              setSedeSeleccionadaState(legacyData.sedeSeleccionada);
              setMostrarModal(false);

              await setDoc(userDocRef, legacyData, { merge: true });
            } else {
              setMostrarModal(true);
            }
          }
        } catch (err) {
          console.error('Error cargando sede del usuario', err);
          setMostrarModal(true);
        }
      }
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSelectSede = async (sede) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, USER_SETTINGS_COLLECTION, user.uid);
      await setDoc(userDocRef, { 
        sedeSeleccionada: sede,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setSedeSeleccionadaState(sede);
      setMostrarModal(false);
    } catch (err) {
      console.error('Error guardando sede', err);
    }
  };

  if (!mostrarModal || cargando) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-900">Selecciona tu sede de trabajo</h3>
        <p className="mt-2 text-sm text-slate-700">
          Esto determina las bodegas y operaciones disponibles. Puedes cambiarla luego si es necesario.
        </p>

        <div className="mt-6 space-y-2 max-h-64 overflow-y-auto">
          {sedes.map((sede) => (
            <button
              key={sede}
              onClick={() => handleSelectSede(sede)}
              className={`${actionBase} border border-slate-200 bg-white text-slate-900 text-left hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-200 cursor-pointer`}
            >
              {sede}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
