import React, { useEffect, useState } from 'react'
import api from '../api';
import { jwtDecode } from 'jwt-decode';
import { ACCESS_TOKEN } from '../constans';
import ProtectedRoots from '../components/ProtectedRoots';
import AddComment from '../components/AddComment';

const Blog = () => {

    const blogId = window.location.pathname.split("/blog/")[1];

    const [Blog, setBlog] = useState(null)

    let currentUserId = null;
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    if (accessToken) {
      try {
        const decodedToken = jwtDecode(accessToken);
        currentUserId = decodedToken.user_id ?? decodedToken.id ?? decodedToken.user?.id ?? null;
      } catch (error) {
        console.error('Invalid access token:', error);
      }
    }

    const fetchBlog = async () => {
        try{
            const response = await api.get(`/api/posts/${blogId}/`);
            setBlog(response.data);
        } catch (error) {
            console.error("Error fetching blog:", error);
        }
    };

    useEffect(() => {
        fetchBlog();
    }, [blogId]);

    const handleCommentAdded = (newComment) => {
      setBlog((prev) => ({
        ...prev,
        comments: [newComment, ...(prev?.comments || [])],
      }));
    };

    const handleDeleteComment = async (commentId) => {
      try {
        const response = await api.delete(`/api/comments/${commentId}/delete/`);
        if (response.status === 204) {
          setBlog((prev) => ({
            ...prev,
            comments: (prev?.comments || []).filter((comment) => comment.id !== commentId),
          }));
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    };

    if (!Blog) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Loading article...
        </div>
      );
    }

  return (
    <div className="space-y-6">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">Article</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{Blog.post.title}</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">By {Blog.post.author}</p>
          <p className="mt-6 whitespace-pre-wrap leading-7 text-slate-700 dark:text-slate-200">{Blog.post.content}</p>
          <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">Updated: {new Date(Blog.post.updated_at).toLocaleString()}</p>
        </article>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Comments</h2>
          
          <ProtectedRoots>
            <AddComment onCommentAdded={handleCommentAdded} />
          </ProtectedRoots>

          <div className="mt-5 space-y-3">
            {Blog.comments && Blog.comments.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Be the first to comment.
              </p>
            )}

            {Blog.comments && Blog.comments.map((comment) => (
              <div key={comment.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-sm text-slate-800 dark:text-slate-100">{comment.content}</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{comment.author} • {new Date(comment.created_at).toLocaleString()}</p>
                  {String(comment.author_id) === String(currentUserId) && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="rounded-full border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-900/20"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
    </div>
  )
}

export default Blog
