/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { BlogProvider, useBlog } from './context/BlogContext';
import Navbar from './components/Navbar';
import Feed from './pages/Feed';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import Library from './pages/Library';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import { useEffect, useState } from 'react';
import api from './api';
import { useLocation } from 'react-router-dom';
import NotFound from './pages/NotFound';
import ProtectedRoots from './components/ProtectedRoots';
import Login from './pages/Login';
const AppContent = () => {

  const { theme } = useBlog();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  type User = {
  name: string;
};



  const fetchUser = async () => {
    try {
      const res = await api.get("/api/whoami/");
      setCurrentUser({
        name: res.data.username,
      });
    } catch (error) {
      setCurrentUser(null);
    } finally {
      setAuthChecked(true);
    }
  };
 useEffect(() => {
  const token = localStorage.getItem("access");
  setAuthChecked(false);

  if (!token) {
    setCurrentUser(null);
    setAuthChecked(true);
    return;
  }

    fetchUser();
  }, [location.pathname]);


  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/auth" element={authChecked && currentUser ? <Navigate to="/" /> : <Auth />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create" element={<ProtectedRoots><CreatePost /></ProtectedRoots>} />
            <Route path="/edit/:id" element={<ProtectedRoots><CreatePost /></ProtectedRoots>} />
            <Route path="/library" element={<ProtectedRoots><Library /></ProtectedRoots>} />
            <Route path="/profile" element={<ProtectedRoots><Profile /></ProtectedRoots>} />
            <Route path="/profile/:userId" element={<ProtectedRoots><Profile /></ProtectedRoots>} />
            <Route path="*" element={<NotFound/>} />
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
