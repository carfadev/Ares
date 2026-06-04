import { useEffect, useMemo, useState, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db, USER_SETTINGS_COLLECTION, LEGACY_USER_SETTINGS_COLLECTION } from '../lib/firebase';
import { doc, getDoc, setDoc, deleteField, updateDoc } from 'firebase/firestore';
import { getSedes } from '../data/sedes';

const USUARIOS_COLLECTION = 'usuarios';

function getInitials(user) {
  const baseText = user?.nombre || user?.displayName || user?.email || 'U';
  const parts = baseText.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return String(baseText[0] || 'U').toUpperCase();
}

export default function UserMenu() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [sedeSeleccionada, setSedeSeleccionada] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const menuRef = useRef(null);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!active) return;

      setUser(currentUser);

      if (!currentUser) {
        setNombreUsuario('');
        setSedeSeleccionada(null);
        return;
      }

      try {
        const userDocRef = doc(db, USER_SETTINGS_COLLECTION, currentUser.uid);
        const usuariosDocRef = doc(db, USUARIOS_COLLECTION, currentUser.uid);

        // Intentar cargar nombre de la colección usuarios
        const usuariosDoc = await getDoc(usuariosDocRef);
        if (usuariosDoc.exists() && usuariosDoc.data()?.nombre) {
          setNombreUsuario(usuariosDoc.data().nombre);
        } else {
          // Fallback al email
          setNombreUsuario(currentUser.email || 'Usuario');
        }

        // Cargar sede seleccionada
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data()?.sedeSeleccionada) {
          setSedeSeleccionada(userDoc.data().sedeSeleccionada);
        }
      } catch (error) {
        console.error('Error cargando datos del usuario', error);
        setNombreUsuario(currentUser.email || 'Usuario');
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  // Recargar sede cuando el modal la cambia
  useEffect(() => {
    const handleSedeChange = (event) => {
      // Recibir sede del evento sin hacer lectura extra a Firestore
      if (event.detail?.sede) {
        setSedeSeleccionada(event.detail.sede);
      }
    };

    // Escuchar cuando el modal cambia la sede
    window.addEventListener('sede-changed', handleSedeChange);
    return () => window.removeEventListener('sede-changed', handleSedeChange);
  }, []);

  const initials = useMemo(() => getInitials({ ...user, nombre: nombreUsuario }), [user, nombreUsuario]);
  const hasDisplayName = Boolean(nombreUsuario?.trim() || user?.displayName?.trim());
  const label = nombreUsuario || user?.displayName || user?.email || 'Usuario';
  const emailLabel = user?.email || 'Sin correo asignado';

  const handleLogout = async () => {
    try {
      // Limpiar sede de Firestore para que pida de nuevo al reentrar
      if (user) {
        const userDocRef = doc(db, USER_SETTINGS_COLLECTION, user.uid);
        await updateDoc(userDocRef, {
          sedeSeleccionada: deleteField()
        }).catch(() => {
          // Si el documento no existe, no importa
        });
      }
      
      await signOut(auth);
      window.location.replace('/login');
    } catch (error) {
      console.error('Error cerrando sesión', error);
      window.location.replace('/login');
    }
  };

  if (!user) {
    return (
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="8" r="5" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="group inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/0 px-1 py-0.5 text-left transition hover:bg-white/40"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Abrir menú de usuario"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(180deg,#0c3c6b_0%,#092b4d_100%)] text-xs font-semibold text-white">
          {initials}
        </span>
        <span className="hidden max-w-24 truncate text-sm font-medium text-slate-700 xl:block">
          {label}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 transition group-hover:text-slate-600" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
          <div className="border-b border-slate-100 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Usuario autenticado</p>
            <p className="mt-2 truncate text-sm font-semibold text-slate-800">{label}</p>
            {hasDisplayName ? <p className="mt-1 truncate text-xs text-slate-500">{emailLabel}</p> : null}
          </div>
          {/* <a
            href="#"
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            onClick={(event) => {
              event.preventDefault();
              setOpen(false);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 13a5 5 0 1 0-5-5" />
              <path d="M12 13v8" />
              <path d="M8 21h8" />
            </svg>
            Ver perfil
          </a> */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m16 17 5-5-5-5" />
              <path d="M21 12H9" />
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      ) : null}
    </div>
  );
}