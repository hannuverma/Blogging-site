import React, { createContext, useContext, useState, useEffect } from 'react';
import { Post, User, Comment, Theme } from '../types';
import { INITIAL_POSTS, INITIAL_USERS } from '../constants';
import api from '../api';

interface BlogContextType {
  posts: Post[];
  users: User[];
  currentUser: User | null;
  comments: Comment[];
  theme: Theme;
  toggleTheme: () => void;
  login: (email: string) => void;
  register: (name: string, email: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addPost: (post: Omit<Post, 'id' | 'authorId' | 'authorName' | 'authorAvatar' | 'createdAt' | 'likes' | 'commentCount'>) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  toggleLike: (postId: string) => void;
  toggleBookmark: (postId: string) => void;
  toggleFollow: (userId: string) => void;
  toggleMute: (userId: string) => void;
  reportUser: (userId: string) => void;
  addComment: (postId: string, content: string) => void;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('vibe-blog-posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('vibe-blog-users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('vibe-blog-current-user');
    return saved ? JSON.parse(saved) : null;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('vibe-blog-comments');
    return saved ? JSON.parse(saved) : [];
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('vibe-blog-theme');
    return (saved as Theme) || 'light';
  });

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

  useEffect(() => {
    localStorage.setItem('vibe-blog-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const login = (email: string) => {
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
    } else {
      alert('User not found. Please register.');
    }
  };

  const register = (name: string, email: string) => {
    if (users.some(u => u.email === email)) {
      alert('Email already registered.');
      return;
    }
    const newUser: User = {
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

  const logout = () => setCurrentUser(null);

  const updateUser = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    // Also update author info in posts if name or avatar changed
    if (updates.name || updates.avatar) {
      setPosts(prev => prev.map(p => p.authorId === currentUser.id ? {
        ...p,
        authorName: updates.name || p.authorName,
        authorAvatar: updates.avatar || p.authorAvatar
      } : p));
    }
  };

  const addPost = (postData: any) => {
    if (!currentUser) return;
    const newPost: Post = {
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

  const updatePost = async (id: string, updates: Partial<Post>) => {
    const res = await api.put(`/api/posts/${id}/edit/`, updates);
  };

  const deletePost = async (id: string) => {
    const res = await api.delete(`/api/posts/${id}/delete/`);
  };

  const toggleLike = (postId: string) => {
    if (!currentUser) return;
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const liked = p.likes.includes(currentUser.id);
        return {
          ...p,
          likes: liked ? p.likes.filter(id => id !== currentUser.id) : [...p.likes, currentUser.id]
        };
      }
      return p;
    }));
  };

  const toggleBookmark = (postId: string) => {
    if (!currentUser) return;
    const isBookmarked = currentUser.bookmarks.includes(postId);
    const updatedUser = {
      ...currentUser,
      bookmarks: isBookmarked 
        ? currentUser.bookmarks.filter(id => id !== postId) 
        : [...currentUser.bookmarks, postId]
    };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  const toggleFollow = (userId: string) => {
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

  const toggleMute = (userId: string) => {
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

  const reportUser = (userId: string) => {
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

  const addComment = (postId: string, content: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      postId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString(),
    };
    setComments(prev => [...prev, newComment]);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p));
  };

  return (
    <BlogContext.Provider value={{
      posts, users, currentUser, comments, theme, toggleTheme,
      login, register, logout, updateUser, addPost, updatePost, deletePost,
      toggleLike, toggleBookmark, toggleFollow, toggleMute, reportUser, addComment
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
