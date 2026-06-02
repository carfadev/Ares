import { SedaProvider } from './SedaContext';
import SedeSelectionModal from './SedeSelectionModal';

export function RootProvider({ children }) {
  return (
    <SedaProvider>
      <SedeSelectionModal />
      {children}
    </SedaProvider>
  );
}
