import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useBlog } from '../context/BlogContext';

const Navbar = () => {
  const { currentUser, logout } = useBlog();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = (
    <>
      <Link to="/" className="text-sm font-medium hover:text-emerald-500 transition-colors">Feed</Link>
      {currentUser && (
        <>
          <Link to="/library" className="text-sm font-medium hover:text-emerald-500 transition-colors">Library</Link>
          <Link to="/create" className="text-sm font-medium hover:text-emerald-500 transition-colors">Write</Link>
        </>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 border-b transition-colors duration-300 bg-black/80 border-zinc-800 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black font-bold transition-colors">
                V
              </div>
              <span className="text-base sm:text-xl font-bold tracking-tight">VibeBlog</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navLinks}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">

            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link to="/profile" className="flex items-center gap-2 group">
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-800" 
                  />
                  <span className="hidden md:inline text-sm font-medium group-hover:text-emerald-500 transition-colors max-w-28 truncate">
                    {currentUser.name}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-500 hover:text-red-500 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-3 sm:px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs sm:text-sm font-bold rounded-full transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-zinc-800 py-3 space-y-2">
            <div className="flex flex-col gap-2">
              {navLinks}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;