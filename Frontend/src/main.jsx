import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx'; // Changed extension from .tsx to .jsx
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Removed the '!' operator which is TypeScript-only
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <StrictMode>
    <GoogleOAuthProvider clientId="379118052183-m8c5h1g87oecvpbmnsclijamf4ocp9il.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);