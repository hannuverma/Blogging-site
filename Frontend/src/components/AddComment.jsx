import React from 'react'
import { useState } from 'react';
import api from '../api';

const AddComment = ({ onCommentAdded }) => {

    const [comment, setComment] = useState({
        content: '',
    });
    const blogId = window.location.pathname.split("/blog/")[1];

    const handleChange = (e) => {
        setComment({ ...comment, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            
            const response = await api.post(`/api/posts/${blogId}/comments/create/`, { content: comment.content });
            if (response.status === 201) {
              if (onCommentAdded) {
                onCommentAdded(response.data);
              }
              setComment({ content: '' });
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };


  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        <label htmlFor="content" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
          Add your comment
        </label>
        <textarea
          id="content"
          name="content"
          value={comment.content}
          onChange={handleChange}
          required
          rows={4}
          placeholder="Share your thoughts..."
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-orange-400 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <button
          type="submit"
          className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Post comment
        </button>
      </form>
    </div>
  )
}

export default AddComment
