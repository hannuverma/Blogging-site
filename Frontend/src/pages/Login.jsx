import React, { useState } from 'react'
import { useNavigate, Link } from "react-router-dom";
import api from '../api';

const Login = () => {

    const [email, setemail] = useState('')
    const [password, setpassword] = useState('')
    const navigate = useNavigate()
	const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true);
        try{
            const response = await api.post('/api/token/', { email, password });
            if (response.status === 200) {
                localStorage.setItem('access', response.data.access);
                localStorage.setItem('refresh', response.data.refresh);
                navigate('/')
            }
        }catch(error){
            console.error('Error during login:', error);
        }
        finally{
            setLoading(false);
        }
    }

  return (
    <div className="mx-auto mt-8 max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Welcome back</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Sign in to write posts and join discussions.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setemail(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-orange-400 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setpassword(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-orange-400 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
        New here?{' '}
        <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-500 dark:text-sky-400">
          Create an account
        </Link>
      </p>
    </div>
  )
}

export default Login
