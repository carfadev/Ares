import { SedaProvider } from './SedaContext';

export default function SedaContextProvider({ children }) {
  return (
    <SedaProvider>
      {children}
    </SedaProvider>
  );
}
