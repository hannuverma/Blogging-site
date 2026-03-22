import React, { useEffect, useMemo, useState } from 'react'
import Navbar from './components/Navbar'
import ProtectedRoots from './components/ProtectedRoots'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home'; 
import NotFound from './pages/NotFound';
import Blog from './pages/Blog';
import CreatePost from './pages/CreatePost';

const Logout = () => {
  localStorage.clear()
  return <Navigate to="/home" />;
}

const RegisterAndLogout = () => { 
  localStorage.clear()
  return <Register to="/home" />;
}

const AppLayout = ({ theme, onToggleTheme }) => {
  const location = useLocation();
  const hideNavbar = useMemo(() => location.pathname === '/login' || location.pathname === '/register', [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.12),_transparent_34%)]" />
      <div className="relative z-10">
        {!hideNavbar && <Navbar theme={theme} onToggleTheme={onToggleTheme} />}
        <main className="mx-auto w-full max-w-6xl px-4 pb-10 pt-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterAndLogout />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/blog/:id" element={<Blog />} />
            <Route path="/create-post" element={<ProtectedRoots><CreatePost /></ProtectedRoots>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const onToggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <BrowserRouter>
      <AppLayout theme={theme} onToggleTheme={onToggleTheme} />
    </BrowserRouter>
  )
}

export default App
