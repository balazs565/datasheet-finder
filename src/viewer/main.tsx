import React from 'react';
import { createRoot } from 'react-dom/client';
import { ViewerApp } from './ViewerApp';
import '../styles/global.css';
import '../styles/components.css';
import './viewer.css';

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <ViewerApp />
    </React.StrictMode>,
  );
}
