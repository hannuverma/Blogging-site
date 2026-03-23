import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBlog } from '../context/BlogContext';
import { ArrowLeft, Save, Send, Image as ImageIcon, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { twMerge } from 'tailwind-merge';
import api from '../api';


const CreatePost = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [Loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
    const [Post, setPost] = useState({
        title: '',
        content: '',
        description: '',
        image: null,
        category: '',
        published: false
    })

    const fetchPost = async () => {
        if (!id) return;
        setLoading(true);
        try{  
            const res = await api.get(`/api/posts/${id}/`);
            setPost(res.data.post);
        } catch (publishedError) {
            console.error('Error fetching post:', publishedError);
            try {
                const res = await api.get(`/api/user/posts/${id}/`);
                setPost(res.data.post);
            } catch (error) {
                console.error('Error fetching user post:', error);
                setPost({
                    title: '',
                    content: '',
                    description: '',
                    image: null,
                    category: '',
                    published: false
                });
            }
        } finally {
            setLoading(false);
        }
      };

    useEffect(() => {
        if (isEditing) {
            fetchPost();
        }
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPost((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };
    const [categories, setCategories] = useState([]);
    const fetchCategories = async () => {
        try {
            const response = await api.get('/api/categories/');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e, shouldPublish = true) => {
        e.preventDefault()
        setIsSaving(true);
        setLoading(true);
        try {
            const FormDataToSend = new FormData();
            FormDataToSend.append('title', Post.title);
            FormDataToSend.append('content', Post.content);
            FormDataToSend.append('description', Post.description);
            FormDataToSend.append('published', String(shouldPublish));
            if (Post.category) {
                FormDataToSend.append('category', Post.category);
            }
            if (Post.image) {
                FormDataToSend.append('image', Post.image);
            }
            if (isEditing) {
                const response = await api.put(`/api/posts/${id}/edit/`, FormDataToSend);
                if (response.status === 200) {
                    setShowSuccess(true);
                    setTimeout(() => {
                        setShowSuccess(false);
                        navigate('/library');
                    }, 1000);
                } else {
                    console.error('Failed to update post:', response.data);
                }
            }
            else {
            const response = await api.post('/api/posts/create/', FormDataToSend);
            if (response.status === 201) {
              setShowSuccess(true);
                setPost({
                    title: '',
                    content: '',
                    description: '',
                    image: null,
                    category: '',
                    published: false
                });
              setImagePreview(null);
              setTimeout(() => {
                setShowSuccess(false);
                navigate('/library');
              }, 1000);
            } else {
                console.error('Failed to create post:', response.data);
            }
          }
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setLoading(false);
            setIsSaving(false);
        }
    };

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setPost((prev) => ({
				...prev,
				image: file,
				imagePreview: URL.createObjectURL(file),
			}));
		}
	};       
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Edit Story' : 'Write a New Story'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => handleSubmit(e, false)}
            disabled={Loading}
            className="px-6 py-2 border border-black dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-bold rounded-full transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={18} /> Save as Draft
          </button>
          <button
            onClick={(e) => handleSubmit(e, true)}
            disabled={Loading}
            className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-full transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            <Send size={18} /> {isEditing ? 'Publish Story' : 'Publish Story'}
          </button>
        </div>
      </header>

      <form className="space-y-8">
        <div className="space-y-2">
          <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Title</label>
          <input
            type="text"
            value={Post.title}
            onChange={(e) => setPost({ ...Post, title: e.target.value })}
            placeholder="Enter a catchy title..."
            className="w-full text-4xl md:text-5xl font-black bg-transparent border-none focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Description</label>
          <textarea
            value={Post.description}
            onChange={(e) => setPost({ ...Post, description: e.target.value })}
            placeholder="A short summary of your story..."
            className="w-full text-xl font-medium bg-transparent border-none focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700 resize-none min-h-20"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Category</label>
            <select
              value={Post.category}
              onChange={(e) => setPost({ ...Post, category: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Select category</option>
              {categories.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Cover Image</label>
          <div className="relative group aspect-video rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center transition-all hover:border-emerald-500/50">
            {Post.image ? (
              <>
                <img src={typeof Post.image === 'string' ? Post.image : imagePreview || ''} alt="Cover preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    setPost({ ...Post, image: null });
                    setImagePreview(null);
                  }}
                  className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <Trash2 size={20} />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 p-8 text-center">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center">
                  <ImageIcon size={32} />
                </div>
                <div>
                  <p className="font-bold text-lg">Add a cover image</p>
                  <p className="text-sm text-zinc-500">Paste a URL or we'll generate one for you</p>
                </div>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  onChange={(e) => setPost({ ...Post, image: e.target.value })}
                  className="w-full max-w-md px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Content</label>
          <textarea
            value={Post.content}
            onChange={(e) => setPost({ ...Post, content: e.target.value })}
            placeholder="Tell your story..."
            className="w-full text-lg leading-relaxed bg-transparent border-none focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700 min-h-100 resize-none"
          />
        </div>
      </form>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-8 right-8 bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50"
          >
            <CheckCircle2 size={32} />
            <div>
              <p className="font-bold text-lg">Story Saved!</p>
              <p className="text-sm opacity-90">Redirecting you to your library...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isSaving && !showSuccess && (
        <div className="fixed inset-0 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="font-bold text-lg animate-pulse">Saving your masterpiece...</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CreatePost;
