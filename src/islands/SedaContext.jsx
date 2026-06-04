import { createContext, useState, useContext } from 'react';

export const SedaContext = createContext();

export function SedaProvider({ children }) {
  const [sedeSeleccionada, setSedeSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  return (
    <SedaContext.Provider value={{ sedeSeleccionada, setSedeSeleccionada, mostrarModal, setMostrarModal }}>
      {children}
    </SedaContext.Provider>
  );
}

export function useSedaContext() {
  const context = useContext(SedaContext);
  if (!context) {
    throw new Error('useSedaContext debe usarse dentro de SedaProvider');
  }
  return context;
}
