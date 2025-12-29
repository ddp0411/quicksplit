// Main entry point
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from './app/appProviders';
import { AppRoutes } from './routes/AppRoutes';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  </React.StrictMode>
);

