import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { INITIAL_POSTS, INITIAL_USERS } from '../constants';
import api from '../api';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constans';

const BlogContext = createContext(undefined);

const normalizeUser = (raw) => {
  if (!raw) return null;
  const mutedIds = Array.isArray(raw.muted)
    ? raw.muted
    : Array.isArray(raw.mute)
    ? raw.mute
    : [];
  return {
    id: String(raw.id ?? ''),
    name: raw.username ?? raw.name ?? 'User',
    email: raw.email ?? '',
    avatar: raw.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(raw.username ?? raw.name ?? 'User')}&background=0f172a&color=fff`,
    following: Array.isArray(raw.following) ? raw.following.map((id) => String(id)) : [],
    followers: Array.isArray(raw.followers) ? raw.followers.map((id) => String(id)) : [],
    muted: mutedIds.map((id) => String(id)),
    reported: Array.isArray(raw.reported) ? raw.reported.map((id) => String(id)) : [],
    bookmarks: Array.isArray(raw.bookmarks) ? raw.bookmarks.map((id) => String(id)) : [],
    createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
    bio: raw.bio ?? '',
    website: raw.website ?? '',
    location: raw.location ?? '',
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
  authorAvatar:
    post?.author_avatar ??
    post?.authorAvatar ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(post?.author ?? post?.authorName ?? 'User')}&background=e2e8f0&color=0f172a`,
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
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) return null;
    const saved = localStorage.getItem('vibe-blog-current-user');
    return saved ? JSON.parse(saved) : null;
  });

  const [comments, setComments] = useState(() => {
    const saved = localStorage.getItem('vibe-blog-comments');
    return saved ? JSON.parse(saved) : [];
  });

  const [theme] = useState('dark');
  const followInFlightRef = useRef(new Set());
  const fetchCurrentUserSeqRef = useRef(0);
  const fetchPostsSeqRef = useRef(0);

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
    if (currentUser) {
      localStorage.setItem('vibe-blog-current-user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('vibe-blog-current-user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('vibe-blog-comments', JSON.stringify(comments));
  }, [comments]);

  // Theme logic - lock the app to dark mode
  useEffect(() => {
    localStorage.setItem('vibe-blog-theme', 'dark');
    document.documentElement.classList.add('dark');
  }, [theme]);

  const toggleTheme = () => {};

  const fetchCurrentUser = useCallback(async () => {
    const requestSeq = ++fetchCurrentUserSeqRef.current;
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      if (requestSeq === fetchCurrentUserSeqRef.current) {
        setCurrentUser(null);
      }
      return null;
    }

    setIsFetchingUser(true);
    try {
      const res = await api.get('/api/whoami/');
      if (requestSeq !== fetchCurrentUserSeqRef.current) {
        return null;
      }

      const normalized = normalizeUser(res.data);
      
      setCurrentUser(normalized);
      console.log('Fetched current user:', res);
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
      if (requestSeq === fetchCurrentUserSeqRef.current) {
        setCurrentUser(null);
      }
      return null;
    } finally {
      if (requestSeq === fetchCurrentUserSeqRef.current) {
        setIsFetchingUser(false);
      }
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
    const requestSeq = ++fetchPostsSeqRef.current;
    setIsFetchingPosts(true);
    try {
      const response = await api.post('/api/posts/', { category, search });
      const normalizedPosts = Array.isArray(response.data)
        ? response.data.map((post) => normalizePost(post))
        : [];
      if (requestSeq === fetchPostsSeqRef.current) {
        setPosts(normalizedPosts);
      }
      return normalizedPosts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    } finally {
      if (requestSeq === fetchPostsSeqRef.current) {
        setIsFetchingPosts(false);
      }
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
    localStorage.removeItem('vibe-blog-current-user');
    setCurrentUser(null);
  };

  const updateUser = async (updates) => {
    if (!currentUser) return;
    const response = await api.post('/api/users/change_description/', {
      userId: currentUser.id,
      ...updates,
    });
    console.log('User update response:', response);
    const normalized = normalizeUser(response.data);
    const updatedUser = normalized ? { ...currentUser, ...normalized } : { ...currentUser, ...updates };

    setCurrentUser(updatedUser);
    setUsers((prev) =>
      prev.map((u) => (String(u.id) === String(currentUser.id) ? updatedUser : u))
    );

    if (updates.name || updates.avatar) {
      setPosts((prev) =>
        prev.map((p) =>
          String(p.authorId) === String(currentUser.id)
            ? {
                ...p,
                authorName: updatedUser.name || p.authorName,
                authorAvatar: updatedUser.avatar || p.authorAvatar,
              }
            : p
        )
      );
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
    const postId = String(id);
    const previousPosts = posts;
    const previousComments = comments;

    setPosts((prev) => prev.filter((post) => String(post.id) !== postId));
    setComments((prev) => prev.filter((comment) => String(comment.postId) !== postId));

    try {
      await api.delete(`/api/posts/${id}/delete/`);
    } catch (error) {
      setPosts(previousPosts);
      setComments(previousComments);
      console.error('Delete failed', error);
      throw error;
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

  const toggleFollow = async (userId) => {
    if (!currentUser) return;

    const targetUserId = String(userId);
    const currentUserId = String(currentUser.id);
    if (!targetUserId || currentUserId === targetUserId) return;
    if (followInFlightRef.current.has(targetUserId)) return;
    followInFlightRef.current.add(targetUserId);

    const currentFollowing = Array.isArray(currentUser.following)
      ? currentUser.following.map((id) => String(id))
      : [];
    const isFollowing = currentFollowing.includes(targetUserId);

    const updatedCurrentUser = {
      ...currentUser,
      following: isFollowing
        ? currentFollowing.filter((id) => id !== targetUserId)
        : [...currentFollowing, targetUserId],
    };

    // Optimistic update so UI reacts immediately.
    setCurrentUser(updatedCurrentUser);
    setUsers((prev) =>
      prev.map((u) => {
        const uid = String(u.id);
        const followers = Array.isArray(u.followers)
          ? u.followers.map((id) => String(id))
          : [];

        if (uid === currentUserId) {
          return updatedCurrentUser;
        }

        if (uid === targetUserId) {
          return {
            ...u,
            followers: isFollowing
              ? followers.filter((id) => id !== currentUserId)
              : followers.includes(currentUserId)
              ? followers
              : [...followers, currentUserId],
          };
        }

        return u;
      })
    );

    try {
      const response = await api.post('/api/users/follow/', {
        userId: currentUserId,
        targetUserId,
      });

      const normalizedCurrent = normalizeUser(response?.data?.currentUser);
      const normalizedTarget = normalizeUser(response?.data?.targetUser);

      if (normalizedCurrent) {
        setCurrentUser(normalizedCurrent);
      } else {
        await fetchCurrentUser();
      }

      setUsers((prev) => {
        let next = [...prev];

        if (normalizedCurrent) {
          const currentIdx = next.findIndex((u) => String(u.id) === String(normalizedCurrent.id));
          if (currentIdx >= 0) {
            next[currentIdx] = { ...next[currentIdx], ...normalizedCurrent };
          } else {
            next = [normalizedCurrent, ...next];
          }
        }

        if (normalizedTarget) {
          const targetIdx = next.findIndex((u) => String(u.id) === String(normalizedTarget.id));
          if (targetIdx >= 0) {
            next[targetIdx] = { ...next[targetIdx], ...normalizedTarget };
          } else {
            next = [normalizedTarget, ...next];
          }
        }

        return next;
      });
    } catch (error) {
      // Revert optimistic update if backend request fails.
      setCurrentUser(currentUser);
      setUsers((prev) =>
        prev.map((u) => (String(u.id) === currentUserId ? currentUser : u))
      );
      console.error('Error toggling follow:', error);
    } finally {
      followInFlightRef.current.delete(targetUserId);
    }
  };

  const toggleMute = async (userId) => {

    if (!currentUser) return;
    const targetUserId = String(userId);
    const currentUserId = String(currentUser.id);
    if (!targetUserId || currentUserId === targetUserId) return;
    
    const currentMuted = Array.isArray(currentUser.muted)
      ? currentUser.muted.map((id) => String(id))
      : [];
    const isMuted = currentMuted.includes(targetUserId);
    const updatedUser = {
      ...currentUser,
      muted: isMuted
        ? currentMuted.filter((id) => id !== targetUserId)
        : [...currentMuted, targetUserId]
    };
    setCurrentUser(updatedUser);
    setUsers((prev) =>
      prev.map((u) => (String(u.id) === currentUserId ? updatedUser : u))
    );

    try {
      await api.post('/api/users/mute/', {
        userId: currentUserId,
        targetUserId,
      });
      await fetchCurrentUser();
    } catch (error) {
      // Revert optimistic update if backend request fails.
      setCurrentUser(currentUser);
      setUsers((prev) =>
        prev.map((u) => (String(u.id) === currentUserId ? currentUser : u))
      );
      console.error('Error toggling mute:', error);
    }
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