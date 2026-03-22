import React from 'react'
import { Link } from 'react-router-dom';
import { ACCESS_TOKEN } from '../constans';

const Navbar = ({ theme, onToggleTheme }) => {
    const isLoggedIn = Boolean(localStorage.getItem(ACCESS_TOKEN));

    return (
        <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
            <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                <Link
                    to="/"
                    className="text-2xl font-black tracking-tight text-slate-900 transition hover:text-sky-600 dark:text-white dark:hover:text-sky-400"
                >
                    InkJournal
                </Link>

                <div className="flex items-center gap-2 sm:gap-3">
                    <Link
                        to="/"
                        className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                        Home
                    </Link>

                    {isLoggedIn && (
                        <Link
                            to="/create-post"
                            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                        >
                            Write
                        </Link>
                    )}

                    {!isLoggedIn && (
                        <Link
                            to="/login"
                            className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                            Login
                        </Link>
                    )}

                    {!isLoggedIn && (
                        <Link
                            to="/register"
                            className="rounded-full border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-500 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-400"
                        >
                            Register
                        </Link>
                    )}

                    {isLoggedIn && (
                        <Link
                            to="/logout"
                            className="rounded-full border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-500 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-400"
                        >
                            Logout
                        </Link>
                    )}

                    <button
                        type="button"
                        onClick={onToggleTheme}
                        className="rounded-full border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-500 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-400"
                    >
                        {theme === 'dark' ? 'Light' : 'Dark'}
                    </button>
                </div>
            </nav>
        </header>
    );
};

export default Navbar
