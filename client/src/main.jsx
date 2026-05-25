import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          style: { borderRadius: '12px', background: '#1a1a2e', color: '#fff', border: '1px solid #ff6b9d33' },
          success: { iconTheme: { primary: '#ff6b9d', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
