/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { BlogProvider, useBlog } from './context/BlogContext';
import Navbar from './components/Navbar';
import Feed from './pages/Feed';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import Library from './pages/Library';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import ProtectedRoots from './components/ProtectedRoots';
import Login from './pages/Login';

const AppContent = () => {
  const { theme, currentUser, fetchCurrentUser } = useBlog();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access");
    
    if (!token) {
      fetchCurrentUser();
      setAuthChecked(true);
      return;
    }

    (async () => {
      await fetchCurrentUser();
      setAuthChecked(true);
    })();
  }, [location.pathname, fetchCurrentUser]);

  // Optional: Prevent flicker while checking auth on initial load
  if (!authChecked) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
        <div className="animate-pulse text-emerald-500 font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/post/:id" element={<PostDetail />} />
          
          {/* Redirect to home if user is already logged in and tries to access /auth */}
          <Route 
            path="/auth" 
            element={currentUser ? <Navigate to="/" /> : <Auth />} 
          />
          
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/create" element={<ProtectedRoots><CreatePost /></ProtectedRoots>} />
          <Route path="/edit/:id" element={<ProtectedRoots><CreatePost /></ProtectedRoots>} />
          <Route path="/library" element={<ProtectedRoots><Library /></ProtectedRoots>} />
          <Route path="/profile" element={<ProtectedRoots><Profile /></ProtectedRoots>} />
          <Route path="/profile/:userId" element={<ProtectedRoots><Profile /></ProtectedRoots>} />
          
          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BlogProvider>
      <Router>
        <AppContent />
      </Router>
    </BlogProvider>
  );
}