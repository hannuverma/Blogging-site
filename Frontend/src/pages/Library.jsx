import React, { useState, useMemo, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion'; // Check if your version is 'motion/react' or 'framer-motion'
import { Link, useNavigate } from 'react-router-dom';
import { Search, PenTool, MoreHorizontal, Trash2, Edit3, Eye, EyeOff, Heart, MessageCircle, Library as LibraryIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from '../api';

// Utility for Tailwind class merging
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const LibraryPostCard = ({ post, onDelete, onTogglePublish }) => {
  const [showMenu, setShowMenu] = useState(false);

  // Fallback for null images
  const postImage = post.image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row gap-6 p-4"
    >
      <Link to={`/post/${post.id}`} className="block w-full sm:w-48 aspect-video sm:aspect-square rounded-xl overflow-hidden shrink-0">
        <img
          src={postImage}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      <div className="flex-1 flex flex-col justify-between py-2">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                post.bookmarked
                  ? "bg-emerald-500 text-white"
                  : post.published
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
              )}>
                {post.bookmarked ? 'Bookmarked' : (post.published ? 'Published' : 'Draft')}
              </span>
              <span className="text-xs text-zinc-400">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <MoreHorizontal size={18} />
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
                      <Link
                        to={`/edit/${post.id}`}
                        className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Edit3 size={16} /> Edit story
                      </Link>
                      <button
                        onClick={() => { onTogglePublish(post.id, post.published); setShowMenu(false); }}
                        className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        {post.published ? <EyeOff size={16} /> : <Eye size={16} />}
                        {post.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => { onDelete(post.id); setShowMenu(false); }}
                        className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-red-500"
                      >
                        <Trash2 size={16} /> Delete story
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <Link to={`/post/${post.id}`} className="block group/title">
            <h2 className="text-xl font-bold mb-2 group-hover/title:underline transition-colors leading-tight line-clamp-2">
              {post.title}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-2 mb-4">
              {post.description}
            </p>
          </Link>
        </div>

        {/* Note: Backend snippet didn't show likes/comments, so we add default counts */}
        <div className="flex items-center gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
            <Heart size={14} />
            <span>{post.likes?.length || 0} likes</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
            <MessageCircle size={14} />
            <span>{post.commentCount || 0} comments</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Library = () => {
  const [posts, setPosts] = useState([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchUserPosts = async () => {
    try {
      const res = await api.get("/api/user/posts/");
      const normalizedPosts = Array.isArray(res.data) ? res.data.map(post => ({
        ...post,
        likes: Array.isArray(post.likes) ? post.likes.map(id => String(id)) : []
      })) : [];
      setPosts(normalizedPosts);
    } catch (error) {
      console.error("Failed to fetch user posts:", error);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await api.get("/api/whoami/");
      setCurrentUser({
        ...res.data,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(res.data.username)}&background=0f172a&color=fff`,
        bookmarks: res.data.bookmarks || []
      });
    } catch (error) {
      console.error("Auth error", error);
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      fetchUser();
      fetchUserPosts();
    } else {
      navigate('/login');
    }
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/api/posts/${id}/delete/`);
        setPosts(posts.filter(p => p.id !== id));
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      const res = await api.patch(`/api/user/posts/${id}/`, { published: !currentStatus });
      setPosts(posts.map(p => p.id === id ? { ...p, published: res.data.published } : p));
    } catch (err) {
      alert("Update failed");
    }
  };

  const fetchBookmarkedPosts = async () => {
    try {
      const [bookmarksRes, allPostsRes] = await Promise.all([
        api.get("/api/bookmarks/"),
        api.post("/api/posts/", { category: 'All', search: '' }),
      ]);

      const bookmarkedPostIdSet = new Set(
        (bookmarksRes.data || []).map((b) => Number(b.post_id))
      );

      const userBookmarkedPosts = (allPostsRes.data || []).filter((post) =>
        bookmarkedPostIdSet.has(Number(post.id))
      );

      const normalizePost = (post) => ({
        ...post,
        likes: Array.isArray(post.likes) ? post.likes.map(id => String(id)) : [],
        bookmarked: true
      });

      setBookmarkedPosts(userBookmarkedPosts.map(normalizePost));
      setPosts((prevPosts) => prevPosts.map((post) => ({
        ...post,
        likes: Array.isArray(post.likes) ? post.likes.map(id => String(id)) : [],
        bookmarked: bookmarkedPostIdSet.has(Number(post.id)),
      })));
    } catch (err) {
      console.error("Failed to fetch bookmarks", err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchBookmarkedPosts();
    }
  }, [currentUser]);


  const filteredPosts = useMemo(() => {
    let base = [];
    switch (activeTab) {
      case 'published': base = posts.filter(p => p.published); break;
      case 'drafts': base = posts.filter(p => !p.published); break;
      case 'bookmarks': base = bookmarkedPosts; break;
      default: base = posts;
    }

    return base.filter(p => 
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeTab, posts, bookmarkedPosts, searchQuery, currentUser]);

  return (
    <div className="mx-auto max-w-5xl px-2 sm:px-4 py-6 sm:py-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Your Library</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage your stories and drafts.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500" size={18} />
            <input
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-full sm:w-64"
            />
          </div>
          <Link to="/create" className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-full flex items-center justify-center gap-2 shadow-lg">
            <PenTool size={18} /> Write Story
          </Link>
        </div>
      </header>

      <div className="flex items-center gap-2 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800 pb-px scrollbar-hide">
        {['all', 'published', 'drafts', 'bookmarks'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 sm:px-6 py-4 text-sm font-bold capitalize transition-all relative whitespace-nowrap",
              activeTab === tab ? "text-black dark:text-white" : "text-zinc-500 hover:text-zinc-900"
            )}
          >                                                                                                                                                                                                                                                        
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white" />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredPosts.map((post) => (                                                                                                                                                                                
            <LibraryPostCard 
              key={post.id} 
              post={post} 
              onDelete={handleDelete} 
              onTogglePublish={handleTogglePublish}
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
          <LibraryIcon className="text-zinc-400 mx-auto mb-4" size={32} />
          <h3 className="text-lg font-semibold">No stories found</h3>
          <p className="text-zinc-500">Try changing your filters or write a new story.</p>
        </div>
      )}
    </div>
  );
};

export default Library;