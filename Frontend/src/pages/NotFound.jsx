import React from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Link } from 'react-router-dom';
import LottieFile from '../assets/404error.lottie'; // Note the './'
const NotFound = () => {
  return (
    <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">The story you are trying to open does not exist.</p>
        <div className="mx-auto mt-4 max-w-lg">
          <DotLottieReact src={LottieFile} loop autoplay />
        </div>
        <Link
          to="/"
          className="inline-flex rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Back to Home
        </Link>
    </div>
  )
}

export default NotFound
