// main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Use standard DOM API to avoid JSX transpilation issues
const container = document.getElementById('root');
const root = createRoot(container);
root.render(React.createElement(
  React.StrictMode, 
  null, 
  React.createElement(App, null)
));