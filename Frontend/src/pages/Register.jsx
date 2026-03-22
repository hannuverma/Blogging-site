import React, { useState } from 'react'
import { useNavigate, Link } from "react-router-dom";
import api from '../api';

const Register = () => {
    const [Username, setUsername] = useState('')
    const [Email, setEmail] = useState('')
    const [Password, setPassword] = useState('')
    const navigate = useNavigate()
	const [loading, setLoading] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true);
        try {
            const response = await api.post('/api/register/', { username: Username, email: Email, password: Password });

            if (response.status === 201) {
                const tokenResponse = await api.post('/api/token/', { email: Email, password: Password });
                localStorage.setItem('access', tokenResponse.data.access);
                localStorage.setItem('refresh', tokenResponse.data.refresh);
                navigate('/')
            } else {
                console.error('Registration failed:', response.data);
            }
        } catch (error) {
            console.error('Error during registration:', error);
        }
        finally {
            setLoading(false);
            navigate('/')
        }
    }
  return (
    <div className="mx-auto mt-8 max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Create account</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Join the writing community and publish your first story.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={Username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-orange-400 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <input
          type="email"
          placeholder="Email"
          value={Email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-orange-400 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <input
          type="password"
          placeholder="Password"
          value={Password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-orange-400 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-500 dark:text-sky-400">
          Login
        </Link>
      </p>
    </div>
  )
}

export default Register
