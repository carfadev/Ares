import { createContext, useState, useEffect } from 'react';

export const SedaContext = createContext();

export function SedaProvider({ children }) {
  const [sedeSeleccionada, setSedeSeleccionadaState] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  // Al cargar, verificar si hay sede en localStorage
  useEffect(() => {
    const sedaGuardada = localStorage.getItem('sedeSeleccionada');
    if (sedaGuardada) {
      setSedeSeleccionadaState(sedaGuardada);
    }
  }, []);

  // Escuchar cambios en localStorage desde otras pestañas/islas
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'sedeSeleccionada' && e.newValue) {
        setSedeSeleccionadaState(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Cuando cambia la sede, guardar en localStorage
  const seleccionarSede = (sede) => {
    setSedeSeleccionadaState(sede);
    localStorage.setItem('sedeSeleccionada', sede);
    setMostrarModal(false);
  };

  return (
    <SedaContext.Provider value={{ sedeSeleccionada, setSedeSeleccionada: seleccionarSede, mostrarModal, setMostrarModal }}>
      {children}
    </SedaContext.Provider>
  );
}

export function useSedaContext() {
  const context = React.useContext(SedaContext);
  if (!context) {
    // Fallback cuando no hay provider (para islas independientes)
    const [sede, setSede] = React.useState(() => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('sedeSeleccionada') || null;
      }
      return null;
    });

    React.useEffect(() => {
      const handleStorageChange = (e) => {
        if (e.key === 'sedeSeleccionada') {
          setSede(e.newValue);
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return {
      sedeSeleccionada: sede,
      setSedeSeleccionada: (sede) => {
        setSede(sede);
        localStorage.setItem('sedeSeleccionada', sede);
      },
      mostrarModal: false,
      setMostrarModal: () => {}
    };
  }
  return context;
}
