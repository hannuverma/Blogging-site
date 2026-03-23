import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Bookmark, Heart, MessageCircle, MoreHorizontal, UserPlus, UserMinus, EyeOff, Flag } from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { Post, User } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from '../api';
import { useLocation } from 'react-router-dom';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const {toggleLike, toggleBookmark, toggleFollow, toggleMute, reportUser } = useBlog();
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();
    type User = {
  name: string;
  email: string;
  avatar: string;
  id: string;
  bookmarks: string[];
  following: string[];
  muted: string[];
};

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    fetchUser();
    navigate('/');
  };

  const fetchUser = async () => {
    try {
      const res = await api.get("/api/whoami/");
      setCurrentUser({
        name: res.data.username,
        email: res.data.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(res.data.username)}&background=0f172a&color=fff`,
        id: String(res.data.id),
        bookmarks: Array.isArray(res.data.bookmarks) ? res.data.bookmarks.map((bookmarkId: number | string) => String(bookmarkId)) : [],
        following: [],
        muted: [],

      });
    } catch (error) {
      setCurrentUser(null);
    }
  };
 useEffect(() => {
  const token = localStorage.getItem("access");

  if (!token) {
    setCurrentUser(null);
    return;
  }

    fetchUser();
  }, [location.pathname]);

  const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
  const isBookmarked = currentUser ? currentUser.bookmarks.includes(String(post.id)) : false;
  const isFollowing = currentUser ? currentUser.following.includes(post.authorId) : false;
  const isMuted = currentUser ? currentUser.muted.includes(post.authorId) : false;

  const handleBookmarkClick = async () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    try {
      await toggleBookmark(post.id, currentUser.id);
      setCurrentUser((prev) => {
        if (!prev) return prev;
        const postId = String(post.id);
        const alreadyBookmarked = prev.bookmarks.includes(postId);
        return {
          ...prev,
          bookmarks: alreadyBookmarked
            ? prev.bookmarks.filter((id) => id !== postId)
            : [...prev.bookmarks, postId],
        };
      });
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  if (isMuted) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <Link to={`/post/${post.id}`} className="block aspect-video overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
      </Link>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${post.authorId}`} className="shrink-0">
              <img src={post.authorAvatar} alt={post.authorName} className="w-10 h-10 rounded-full object-cover border border-zinc-100 dark:border-zinc-800" />
            </Link>
            <div>
              <Link to={`/profile/${post.authorId}`} className="text-sm font-bold hover:underline transition-colors">
                {post.authorName}
              </Link>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <MoreHorizontal size={20} />
            </button>

            <AnimatePresence>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-20 py-1 overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        toggleFollow(post.authorId);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      {isFollowing ? <UserMinus size={16} /> : <UserPlus size={16} />}
                      {isFollowing ? 'Unfollow author' : 'Follow author'}
                    </button>
                    <button
                      onClick={() => {
                        toggleMute(post.authorId);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-amber-500"
                    >
                      <EyeOff size={16} />
                      Mute author
                    </button>
                    <button
                      onClick={() => {
                        reportUser(post.authorId);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-red-500"
                    >
                      <Flag size={16} />
                      Report author
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <Link to={`/post/${post.id}`} className="block group/title">
          <h2 className="text-xl font-bold mb-2 group-hover/title:underline transition-colors leading-tight">
            {post.title}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-2 mb-6">
            {post.description}
          </p>
        </Link>

        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <button
              onClick={() => toggleLike(post.id)}
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium transition-colors",
                isLiked ? "text-rose-500" : "text-zinc-500 hover:text-rose-500"
              )}
            >
              <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
              <span>{post.likes.length}</span>
            </button>
            <Link
              to={`/post/${post.id}#comments`}
              className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
            >
              <MessageCircle size={18} />
              <span>{post.commentCount}</span>
            </Link>
          </div>

          <button
            onClick={handleBookmarkClick}
            className={cn(
              "p-2 rounded-full transition-colors",
              isBookmarked ? "text-black dark:text-white bg-zinc-100 dark:bg-zinc-800" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
          >
            <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Feed: React.FC = () => {
  const [Posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeCategory, setActiveCategory] = useState('All');
  type category = {
  value: string;
  label: string;
  };
    const [categories, setCategories] = useState<[string, string][]>([]);
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
  const body = {
    category: activeCategory,
    search: searchQuery // Move it here
  };
  const fetchPosts = async () => {
    try {
      const response = await api.post('/api/posts/', body);

      const normalizedPosts: Post[] = response.data.map((post: any) => ({
        id: String(post.id),
        title: post.title ?? '',
        description: post.description ?? '',
        content: post.content ?? '',
        image: post.image ?? 'https://picsum.photos/seed/default/1200/600',
        category: post.category ?? 'Other',
        authorId: String(post.author_id ?? ''),
        authorName: post.author ?? 'Unknown author',
        authorAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author ?? 'User')}&background=e2e8f0&color=0f172a`,
        published: Boolean(post.published),
        createdAt: post.created_at ?? new Date().toISOString(),
        likes: Array.isArray(post.likes) ? post.likes : [],
        commentCount: typeof post.commentCount === 'number' ? post.commentCount : 0,
        isBookmarked: Boolean(post.is_bookmarked)
      }));
      
      setPosts(normalizedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeCategory, searchQuery]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Discover Stories</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Explore the latest insights and stories from our community.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-full sm:w-64"
            />
          </div>

          <div className="flex items-center bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-full p-1">
            {['all', 'recent', 'popular'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(  
                  "px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all",
                  activeFilter === filter 
                    ? "bg-black dark:bg-white text-white dark:text-black shadow-md" 
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(([value, label]) => (
          <button
            key={value}
            onClick={() => setActiveCategory(value)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
              activeCategory === value
                ? "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black"
                : "bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-600"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {Posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </AnimatePresence>
      </div>

      {Posts.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-zinc-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-1">No stories found</h3>
          <p className="text-zinc-500 dark:text-zinc-400">Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      )}
    </div>
  );
};

export default Feed;
