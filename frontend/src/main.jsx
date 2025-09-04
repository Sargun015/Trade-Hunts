import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import  AppContextProvider  from './context/AppContext.jsx';
import { EscrowProvider } from './context/EscrowContext';




createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <AppContextProvider>
  <EscrowProvider>
  <App />
  </EscrowProvider>
  </AppContextProvider>
  </BrowserRouter>
)
