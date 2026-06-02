import React from 'react';
import { createRoot } from 'react-dom/client';
import { SettingsApp } from './SettingsApp';
import '../styles/global.css';
import '../styles/components.css';
import './options.css';

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <SettingsApp />
    </React.StrictMode>,
  );
}
