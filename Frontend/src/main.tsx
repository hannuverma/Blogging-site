import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId="379118052183-m8c5h1g87oecvpbmnsclijamf4ocp9il.apps.googleusercontent.com">
  <App />
  </GoogleOAuthProvider>
);
