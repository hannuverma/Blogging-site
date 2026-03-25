import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_POSTS, INITIAL_USERS } from '../constants';
import api from '../api';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constans';

const BlogContext = createContext(undefined);

const normalizeUser = (raw) => {
  if (!raw) return null;
  return {
    id: String(raw.id ?? ''),
    name: raw.username ?? raw.name ?? 'User',
    email: raw.email ?? '',
    avatar: raw.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(raw.username ?? raw.name ?? 'User')}&background=0f172a&color=fff`,
    following: Array.isArray(raw.following) ? raw.following.map((id) => String(id)) : [],
    followers: Array.isArray(raw.followers) ? raw.followers.map((id) => String(id)) : [],
    muted: Array.isArray(raw.muted) ? raw.muted.map((id) => String(id)) : [],
    reported: Array.isArray(raw.reported) ? raw.reported.map((id) => String(id)) : [],
    bookmarks: Array.isArray(raw.bookmarks) ? raw.bookmarks.map((id) => String(id)) : [],
  };
};

const normalizePost = (post) => ({
  id: String(post?.id ?? ''),
  title: post?.title ?? '',
  description: post?.description ?? '',
  content: post?.content ?? '',
  image: post?.image ?? 'https://picsum.photos/seed/default/1200/600',
  category: post?.category ?? 'Other',
  authorId: String(post?.author_id ?? post?.authorId ?? ''),
  authorName: post?.author ?? post?.authorName ?? 'Unknown author',
  authorAvatar: post?.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post?.author ?? post?.authorName ?? 'User')}&background=e2e8f0&color=0f172a`,
  published: Boolean(post?.published),
  createdAt: post?.created_at ?? post?.createdAt ?? new Date().toISOString(),
  likes: Array.isArray(post?.likes) ? post.likes.map((id) => String(id)) : [],
  commentCount:
    typeof post?.comment_count === 'number'
      ? post.comment_count
      : typeof post?.commentCount === 'number'
      ? post.commentCount
      : 0,
  isBookmarked: Boolean(post?.is_bookmarked),
});

const normalizeComment = (comment) => ({
  id: String(comment?.id ?? ''),
  postId: String(comment?.post ?? comment?.postId ?? ''),
  authorId: String(comment?.author_id ?? comment?.authorId ?? ''),
  authorName: comment?.author ?? comment?.authorName ?? 'Anonymous',
  authorAvatar: comment?.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment?.author ?? comment?.authorName ?? 'Anonymous')}&background=f1f5f9&color=0f172a`,
  content: comment?.content ?? '',
  createdAt: comment?.created_at ?? comment?.createdAt ?? new Date().toISOString(),
});

export const BlogProvider = ({ children }) => {
  
  // State Initialization from LocalStorage
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('vibe-blog-posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('vibe-blog-users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('vibe-blog-current-user');
    return saved ? JSON.parse(saved) : null;
  });

  const [comments, setComments] = useState(() => {
    const saved = localStorage.getItem('vibe-blog-comments');
    return saved ? JSON.parse(saved) : [];
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('vibe-blog-theme');
    return saved || 'light';
  });

  const [isFetchingPosts, setIsFetchingPosts] = useState(false);
  const [isFetchingUser, setIsFetchingUser] = useState(false);

  // Syncing State to LocalStorage
  useEffect(() => {
    localStorage.setItem('vibe-blog-posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('vibe-blog-users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('vibe-blog-current-user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('vibe-blog-comments', JSON.stringify(comments));
  }, [comments]);

  // Theme logic
  useEffect(() => {
    localStorage.setItem('vibe-blog-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      setCurrentUser(null);
      return null;
    }

    setIsFetchingUser(true);
    try {
      const res = await api.get('/api/whoami/');
      const normalized = normalizeUser(res.data);
      setCurrentUser(normalized);
      if (normalized) {
        setUsers((prev) => {
          const exists = prev.some((u) => String(u.id) === String(normalized.id));
          return exists
            ? prev.map((u) => (String(u.id) === String(normalized.id) ? { ...u, ...normalized } : u))
            : [normalized, ...prev];
        });
      }
      return normalized;
    } catch (error) {
      setCurrentUser(null);
      return null;
    } finally {
      setIsFetchingUser(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/api/categories/');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }, []);

  const fetchPosts = useCallback(async ({ category = 'All', search = '' } = {}) => {
    setIsFetchingPosts(true);
    try {
      const response = await api.post('/api/posts/', { category, search });
      const normalizedPosts = Array.isArray(response.data)
        ? response.data.map((post) => normalizePost(post))
        : [];
      setPosts(normalizedPosts);
      return normalizedPosts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    } finally {
      setIsFetchingPosts(false);
    }
  }, []);

  const fetchPostDetail = useCallback(async (id) => {
    if (!id) return { post: null, comments: [] };

    const fetchers = [
      () => api.get(`/api/posts/${id}/`),
      () => api.get(`/api/user/posts/${id}/`),
    ];

    for (const runFetch of fetchers) {
      try {
        const res = await runFetch();
        const normalizedComments = Array.isArray(res.data?.comments)
          ? res.data.comments.map((comment) => normalizeComment(comment))
          : [];
        const normalizedPost = normalizePost({
          ...res.data?.post,
          comment_count: normalizedComments.length,
        });

        setComments((prev) => {
          const byPost = prev.filter((c) => String(c.postId) !== String(normalizedPost.id));
          return [...normalizedComments, ...byPost];
        });
        setPosts((prev) => {
          const exists = prev.some((p) => String(p.id) === String(normalizedPost.id));
          return exists
            ? prev.map((p) => (String(p.id) === String(normalizedPost.id) ? { ...p, ...normalizedPost } : p))
            : [normalizedPost, ...prev];
        });

        return {
          post: normalizedPost,
          comments: normalizedComments,
        };
      } catch (error) {
        continue;
      }
    }

    return { post: null, comments: [] };
  }, []);

  const fetchCommentsByPost = useCallback(async (postId) => {
    const detail = await fetchPostDetail(postId);
    return detail.comments;
  }, [fetchPostDetail]);

  const fetchRelatedPosts = useCallback(async (currentPost) => {
    try {
      const res = await api.get('/api/posts/');
      const normalized = Array.isArray(res.data) ? res.data.map((p) => normalizePost(p)) : [];
      return normalized
        .filter((p) => String(p.id) !== String(currentPost?.id) && (p.category === currentPost?.category || currentPost?.category === 'Other'))
        .slice(0, 3);
    } catch (error) {
      console.error('Error fetching related posts:', error);
      return [];
    }
  }, []);

  const login = (email) => {
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
    } else {
      alert('User not found. Please register.');
    }
  };

  const register = (name, email) => {
    if (users.some(u => u.email === email)) {
      alert('Email already registered.');
      return;
    }
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      avatar: `https://picsum.photos/seed/${name}/200`,
      following: [],
      followers: [],
      muted: [],
      reported: [],
      bookmarks: [],
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    setCurrentUser(null);
  };

  const updateUser = (updates) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    
    if (updates.name || updates.avatar) {
      setPosts(prev => prev.map(p => p.authorId === currentUser.id ? {
        ...p,
        authorName: updates.name || p.authorName,
        authorAvatar: updates.avatar || p.authorAvatar
      } : p));
    }
  };

  const addPost = (postData) => {
    if (!currentUser) return;
    const newPost = {
      ...postData,
      id: Math.random().toString(36).substr(2, 9),
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      createdAt: new Date().toISOString(),
      likes: [],
      commentCount: 0,
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const updatePost = async (id, updates) => {
    try {
        const res = await api.put(`/api/posts/${id}/edit/`, updates);
        setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        return res.data;
    } catch (error) {
        console.error("Update failed", error);
    }
  };

  const deletePost = async (id) => {
    try {
        await api.delete(`/api/posts/${id}/delete/`);
        setPosts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
        console.error("Delete failed", error);
    }
  };

  const toggleLike = async (postId, userId) => {
    if (!userId) return;
    try {
      const body = { postId };
      const response = await api.post(`/api/posts/${postId}/like/`, body);
      return response.data;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  };

  const toggleBookmark = async (postId, userId) => {
    if (!userId) return;
    try {
      const body = { postId, userId };
      const response = await api.post('/api/bookmarks/create/', body);
      return response.data;
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  };

  const toggleFollow = (userId) => {
    if (!currentUser || currentUser.id === userId) return;
    const isFollowing = currentUser.following.includes(userId);
    
    const updatedCurrentUser = {
      ...currentUser,
      following: isFollowing 
        ? currentUser.following.filter(id => id !== userId) 
        : [...currentUser.following, userId]
    };

    setCurrentUser(updatedCurrentUser);
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) return updatedCurrentUser;
      if (u.id === userId) {
        return {
          ...u,
          followers: isFollowing 
            ? u.followers.filter(id => id !== currentUser.id) 
            : [...u.followers, currentUser.id]
        };
      }
      return u;
    }));
  };

  const toggleMute = (userId) => {
    if (!currentUser) return;
    const isMuted = currentUser.muted.includes(userId);
    const updatedUser = {
      ...currentUser,
      muted: isMuted 
        ? currentUser.muted.filter(id => id !== userId) 
        : [...currentUser.muted, userId]
    };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  const reportUser = (userId) => {
    if (!currentUser) return;
    if (currentUser.reported.includes(userId)) return;
    const updatedUser = {
      ...currentUser,
      reported: [...currentUser.reported, userId]
    };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    alert('User reported. Thank you for helping keep our community safe.');
  };

  const addComment = async (postId, content) => {
    if (!currentUser || !content?.trim()) return null;
    try {
      const res = await api.post(`/api/posts/${postId}/comments/create/`, { content });
      const newComment = normalizeComment(res.data);
      setComments((prev) => [newComment, ...prev]);
      setPosts((prev) =>
        prev.map((p) =>
          String(p.id) === String(postId)
            ? { ...p, commentCount: Number(p.commentCount || 0) + 1 }
            : p
        )
      );
      return newComment;
    } catch (error) {
      console.error('Error creating comment:', error);
      return null;
    }
  };

  const deletePostAndSync = useCallback(async (id) => {
    await deletePost(id);
    setComments((prev) => prev.filter((c) => String(c.postId) !== String(id)));
  }, [deletePost]);

  return (
    <BlogContext.Provider value={{
      posts, users, currentUser, comments, theme, toggleTheme,
      login, register, logout, updateUser, addPost, updatePost, deletePost,
      toggleLike, toggleBookmark, toggleFollow, toggleMute, reportUser, addComment,
      fetchCurrentUser, fetchCategories, fetchPosts, fetchPostDetail, fetchCommentsByPost,
      fetchRelatedPosts, deletePostAndSync, isFetchingPosts, isFetchingUser
    }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};