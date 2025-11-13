import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { FacilityProvider } from './context/FacilityContext';

createRoot(document.getElementById('root')!).render(
  <FacilityProvider>
    <App />
  </FacilityProvider>
);