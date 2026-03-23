import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Search, PlusSquare, Library, User, LogOut, PenTool } from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { motion } from 'motion/react';
import api from '../api';
const Navbar: React.FC = () => {

  type User = {
  name: string;
  email: string;
  avatar: string;
};


  const { theme, toggleTheme } = useBlog();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    fetchUser();
    navigate('/');
  };

  const fetchUser = async () => {
    try {
      const res = await api.get("/api/whoami/");
      setCurrentUser({
        name: res.data.username,
        email: res.data.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(res.data.username)}&background=0f172a&color=fff`,
      });
    } catch (error) {
      setCurrentUser(null);
    }
  };
 useEffect(() => {
  const token = localStorage.getItem("access");

  if (!token) {
    setCurrentUser(null);
    return;
  }

    fetchUser();
  }, [location.pathname]);

  return (
    <nav className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
      theme === 'dark' ? 'bg-black/80 border-zinc-800 backdrop-blur-md' : 'bg-white/80 border-zinc-200 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black font-bold transition-colors">
                V
              </div>
              <span className="text-xl font-bold tracking-tight">VibeBlog</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium hover:text-emerald-500 transition-colors">Feed</Link>
              {currentUser && (
                <>
                  <Link to="/library" className="text-sm font-medium hover:text-emerald-500 transition-colors">Library</Link>
                  <Link to="/create" className="text-sm font-medium hover:text-emerald-500 transition-colors">Write</Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2 group">
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-800" />
                  <span className="hidden sm:inline text-sm font-medium group-hover:text-emerald-500 transition-colors">{currentUser.name}</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                  }}
                  className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-500 hover:text-red-500 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-full transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
