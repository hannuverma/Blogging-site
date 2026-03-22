import React, { useEffect, useState } from 'react'
import api from '../api'
const CreatePost = () => {
    const [Loading, setLoading] = useState(false)
    const [Post, setPost] = useState({
        title: '',
        content: '',
        description: '',
        image: null,
        category: '',
        published: false
    })

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

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true);
        try {
            const FormDataToSend = new FormData();
            FormDataToSend.append('title', Post.title);
            FormDataToSend.append('content', Post.content);
            FormDataToSend.append('description', Post.description);
            FormDataToSend.append('published', String(Post.published));
            if (Post.category) {
                FormDataToSend.append('category', Post.category);
            }
            if (Post.image) {
                FormDataToSend.append('image', Post.image);
            }

            const response = await api.post('/api/posts/create/', FormDataToSend);
            if (response.status === 201) {
                console.log("Post created successfully");
                setPost({
                    title: '',
                    content: '',
                    description: '',
                    image: null,
                    category: '',
                    published: false
                });
            } else {
                console.error('Failed to create post:', response.data);
            }
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setLoading(false);
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
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">Create a new story</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Share your thoughts with a clean, readable post layout.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <input
                    type="text"
                    placeholder="Post title"
                    name="title"
                    value={Post.title}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-orange-400 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <input
                    type="text"
                    placeholder="Post description"
                    name="description"
                    value={Post.description}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-orange-400 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <textarea
                    placeholder="Write your content..."
                    name="content"
                    value={Post.content}
                    onChange={handleInputChange}
                    rows={10}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-900 outline-none ring-orange-400 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    />
                    <select
                        name="category"
                        value={Post.category}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-orange-400 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                            <option key={category[0]} value={category[0]}>
                                {category[1]}
                            </option>
                        ))}
                    </select>
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                    <input
                        type="checkbox"
                        name="published"
                        checked={Post.published}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
                    />
                    Publish now
                </label>

                <button
                    type="submit"
                    disabled={Loading}
                    className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {Loading ? 'Creating...' : 'Create Post'}
                </button>
            </form>
        </div>
    );
}

export default CreatePost
