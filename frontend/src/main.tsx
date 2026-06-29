import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { PartyProvider } from '@/providers/PartyProvider';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PartyProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#042F2E', color: '#fff' },
          success: { iconTheme: { primary: '#14B8A6', secondary: '#fff' } },
        }}
      />
    </PartyProvider>
  </StrictMode>
);
