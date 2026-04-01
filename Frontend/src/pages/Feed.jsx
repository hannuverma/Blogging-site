import React, { useState, useEffect } from 'react';
import { Search, Heart, MessageCircle, MoreHorizontal, UserPlus, UserMinus, EyeOff, Flag, Bookmark, Eye, Trash2, Edit3   } from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion'; // Using standard framer-motion
import { Link, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const PostCard = ({ post: initialPost, currentUser }) => {
  const { toggleLike, toggleBookmark, toggleFollow, toggleMute, reportUser, fetchCurrentUser, deletePost } = useBlog();
  const [showMenu, setShowMenu] = useState(false);
  const [post, setPost] = useState(initialPost);
  
  const navigate = useNavigate();

  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  const isLiked = currentUser ? post.likes.includes(String(currentUser.id)) : false;
  const isBookmarked = currentUser ? currentUser.bookmarks.includes(String(post.id)) : false;
  const isFollowing = currentUser ? currentUser.following.includes(String(post.authorId)) : false;
  const isMuted = currentUser ? currentUser.muted.includes(String(post.authorId)) : false;
  const isAuthor = String(currentUser?.id) === String(post.authorId);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await deletePost(post.id);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handleBookmarkClick = async () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    try {
      await toggleBookmark(post.id, currentUser.id);
      await fetchCurrentUser();
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleLikeClick = async () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    try {
      const userId = String(currentUser.id);
      const alreadyLiked = post.likes.includes(userId);
      
      setPost((prev) => ({
        ...prev,
        likes: alreadyLiked
          ? prev.likes.filter((id) => String(id) !== userId)
          : [...prev.likes, userId],
      }));

      await toggleLike(post.id, currentUser.id);
    } catch (error) {
      console.error('Error toggling like:', error);
      setPost(initialPost);
    }
  };

  if (isMuted) return null;


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
        {/* Left: Author + Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* Author row */}
          <div className="flex items-center gap-3">
            <Link to={`/profile/${post.authorId}`} className="shrink-0">
              <img src={post.authorAvatar} alt={post.authorName} className="w-11 h-11 rounded-full object-cover border border-zinc-100 dark:border-zinc-800" />
            </Link>
            <div>
              <Link to={`/profile/${post.authorId}`} className="text-sm font-bold hover:underline block">
                {post.authorName}
              </Link>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>

          {/* Title + Description */}
          <Link to={`/post/${post.id}`} className="block group/title mt-2">
            <h2 className="text-lg sm:text-xl font-bold group-hover/title:underline leading-snug">
              {post.title}
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-2 mt-2 leading-relaxed">
              {post.description}
            </p>
          </Link>

          {/* Actions */}
          <div className="mt-4 flex items-center justify-between gap-3 pt-1 sm:mt-7 sm:gap-4 sm:pt-2">
            <div className="flex items-center gap-3 sm:gap-5">
              <button
                onClick={handleLikeClick}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors",
                  isLiked ? "text-rose-500" : "text-zinc-500 hover:text-rose-500"
                )}
              >
                <Heart size={23} fill={isLiked ? "currentColor" : "none"} />
                <span>{post.likes.length}</span>
              </button>
              <Link to={`/post/${post.id}#comments`} className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
                <MessageCircle size={23} />
                <span>{post.commentCount}</span>
              </Link>
              <button
                onClick={handleBookmarkClick}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors",
                  isBookmarked ? "text-black dark:text-white" : "text-zinc-500 hover:text-black dark:hover:text-white"
                )}
              >
                <Bookmark size={23} fill={isBookmarked ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Three-dot menu */}
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <MoreHorizontal size={22} />
              </button>
              <AnimatePresence>
                {showMenu && !isAuthor && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-20 py-1 overflow-hidden"
                    >
                      <button onClick={() => { toggleFollow(post.authorId); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        {isFollowing ? <UserMinus size={17} /> : <UserPlus size={17} />}
                        {isFollowing ? 'Unfollow author' : 'Follow author'}
                      </button>
                      <button onClick={() => { toggleMute(post.authorId); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-amber-500">
                        <EyeOff size={17} />
                        {isMuted ? 'Unmute author' : 'Mute author'}
                      </button>
                      <button onClick={() => { reportUser(post.authorId); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-red-500">
                        <Flag size={17} />
                        Report author
                      </button>
                    </motion.div>
                  </>
                )}

                {showMenu && isAuthor && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-20 py-1 overflow-hidden"
                    >
                      <Link
                        to={`/edit/${post.id}`}
                        className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Edit3 size={17} />
                        Edit post
                      </Link>
                      <button onClick={() => { handleDelete(); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-red-500">
                        <Trash2 size={17} />
                        delete post
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* Right: Thumbnail */}
        <Link to={`/post/${post.id}`} className="w-full shrink-0 sm:w-auto">
          <img
            src={post.image}
            alt={post.title}
            className="h-44 w-full object-contain bg-white dark:bg-zinc-900 transition-opacity group-hover:opacity-90 sm:h-48 sm:w-72"
            referrerPolicy="no-referrer"
          />
        </Link>
      </div>
    </motion.div>
  );
};

const Feed = () => {
  const { posts, currentUser, fetchCurrentUser, fetchCategories, fetchPosts, isFetchingPosts } = useBlog();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    (async () => {
      const data = await fetchCategories();
      setCategories(data);

      if (localStorage.getItem('access')) {
        await fetchCurrentUser();
      }
    })();
  }, [fetchCategories, fetchCurrentUser]);

  useEffect(() => {
    fetchPosts({ category: activeCategory, search: debouncedSearchQuery });
  }, [activeCategory, debouncedSearchQuery, fetchPosts]);

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

      <div className="flex flex-col gap-4">
        <AnimatePresence>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={currentUser} />
          ))}
        </AnimatePresence>
      </div>

      {posts.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-zinc-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-1">{isFetchingPosts ? 'Loading stories...' : 'No stories found'}</h3>
          <p className="text-zinc-500 dark:text-zinc-400">{isFetchingPosts ? 'Fetching the latest stories now.' : "Try adjusting your search or filters to find what you're looking for."}</p>
        </div>
      )}
    </div>
  );
};

export default Feed;