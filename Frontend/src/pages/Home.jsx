import React, { useEffect, useState } from 'react'
import api from '../api';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';   

const Home = () => {
    const [Blogs, setBlogs] = useState([])
	const [loading, setLoading] = useState(false);
    const naviagate = useNavigate()

    let currentUserId = null;
    const accessToken = localStorage.getItem('access');
    if (accessToken) {
        try {
            const decodedToken = jwtDecode(accessToken);
            currentUserId = decodedToken.user_id ?? decodedToken.id ?? decodedToken.user?.id ?? null;
        } catch (error) {
            console.error('Invalid access token:', error);
        }   
    }

    const handleBlogDelete = async (blogId) => {
        try {
            const response = await api.delete(`/api/posts/${blogId}/delete/`);
            if (response.status === 204) {
                setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== blogId));
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
        }
    };


    const fetchBlogs = async () => {
        setLoading(true);
        try{
            const response = await api.get('/api/posts/');
            setBlogs(response.data);
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-sky-50 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">Fresh stories</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                    Welcome to your daily blog feed
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
                    Discover thoughtful posts from creators, then dive into comments and conversations.
                </p>
            </section>

            {loading && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    Loading posts...
                </div>
            )}

            {!loading && Blogs.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    No published posts yet.
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2"> {/* Adjusted grid for better side-by-side fit */}
    {Blogs.map((blog) => (
        <article
            key={blog.id}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
            <button
                type="button"
                onClick={() => naviagate(`/blog/${blog.id}`)}
                className="flex w-full items-start justify-between gap-4 text-left"
            >
                {/* Left Side: Content */}
                <div className="flex-1">
                    <h2 className="line-clamp-2 text-lg font-bold text-slate-900 transition group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400">
                        {blog.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
                        {blog.description || blog.content}
                    </p>
                    <p className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                        By {blog.author}
                    </p>
                </div>

                {/* Right Side: Image */}
                {blog.image && (
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 sm:h-32 sm:w-32">
                        <img 
                            src={blog.image} 
                            alt={blog.title} 
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                        />
                    </div>
                )}
            </button>

            {/* Delete Button (Stays outside the main flex button for easier clicking) */}
            {String(blog.author_id) === String(currentUserId) && (
                <button
                    type="button"
                    onClick={() => handleBlogDelete(blog.id)}
                    className="mt-4 rounded-full border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-900/20"
                >
                    Delete post
                </button>
            )}
        </article>
    ))}
</div>
        </div>
    )
}

export default Home
