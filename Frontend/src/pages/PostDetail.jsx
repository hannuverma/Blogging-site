import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark, Share2, ArrowLeft, Send, Trash2, Edit3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useBlog } from '../context/BlogContext';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const PostDetail = () => {
  const {
    posts,
    comments: allComments,
    currentUser,
    fetchCurrentUser,
    fetchPostDetail,
    fetchRelatedPosts,
    addComment,
    toggleLike,
    toggleBookmark,
    deletePost,
  } = useBlog();
  const navigate = useNavigate();
  const { id } = useParams();
  const [commentText, setCommentText] = useState('');
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [ReadingTime, setReadingTime] = useState(0);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [hasLoadedPost, setHasLoadedPost] = useState(false);

  const loadPostDetail = async () => {
    if (!id) return;
    setIsLoadingPost(true);

    const cachedPost = posts.find((p) => String(p.id) === String(id));
    if (cachedPost) {
      setPost(cachedPost);
      setLikesCount(cachedPost?.likes?.length ?? 0);
      setIsLiked(Boolean(cachedPost && currentUser && cachedPost.likes.includes(String(currentUser.id))));
      setIsBookmarked(Boolean(currentUser?.bookmarks?.includes(String(cachedPost.id))));
      const cachedWords = String(cachedPost?.content ?? '').trim().split(/\s+/).filter(Boolean).length;
      setReadingTime(Math.max(1, Math.ceil(cachedWords / 200)));
    }

    const detail = await fetchPostDetail(id);
    setPost(detail.post);
    setLikesCount(detail.post?.likes?.length ?? 0);
    setIsLiked(Boolean(detail.post && currentUser && detail.post.likes.includes(String(currentUser.id))));
    setIsBookmarked(Boolean(currentUser?.bookmarks?.includes(String(detail.post?.id))));
    const words = String(detail.post?.content ?? '').trim().split(/\s+/).filter(Boolean).length;
    setReadingTime(Math.max(1, Math.ceil(words / 200))); // Assuming 200 WPM reading speed
    setHasLoadedPost(true);
    setIsLoadingPost(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('access');
    (async () => {
      const tasks = [loadPostDetail()];
      if (token) {
        tasks.push(fetchCurrentUser());
      }
      await Promise.allSettled(tasks);
    })();
  }, [id, fetchCurrentUser, fetchPostDetail]);

  useEffect(() => {
    if (post) {
      (async () => {
        const related = await fetchRelatedPosts(post);
        setRelatedPosts(related);
      })();
    }
  }, [post?.id, fetchRelatedPosts]);

  useEffect(() => {
    if (post && currentUser) {
      setIsLiked(post.likes.includes(String(currentUser.id)));
    }
  }, [post?.id, currentUser?.id]);

  useEffect(() => {
    if (post) {
      setIsBookmarked(Boolean(currentUser?.bookmarks?.includes(String(post.id))));
    }
  }, [post?.id, currentUser?.bookmarks]);

  if (isLoadingPost && !post) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold mb-4">Loading post...</h2>
      </div>
    );
  }

  if (!isLoadingPost && hasLoadedPost && !post) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold mb-4">Post not found</h2>
        <Link to="/" className="text-emerald-500 hover:underline flex items-center gap-2">
          <ArrowLeft size={20} /> Back to feed
        </Link>
      </div>
    );
  }

  const isAuthor = String(currentUser?.id) === String(post.authorId);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    (async () => {
      if (!currentUser) {
        navigate('/auth');
        return;
      }
      if (!commentText.trim()) return;

      try {
        const newComment = await addComment(post.id, commentText);
        if (!newComment) return;
        setPost((prev) => (prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev));
        setCommentText('');
      } catch (error) {
        console.error('Error creating comment:', error);
      }
    })();
  };


  const handleLike = async () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    try {
      const userId = String(currentUser.id);
      const alreadyLiked = post.likes.includes(userId);
      
      // Update local state immediately
      setPost((prev) => {
        if (!prev) return prev;
        const newLikes = alreadyLiked
          ? prev.likes.filter((id) => id !== userId)
          : [...prev.likes, userId];
        return {
          ...prev,
          likes: newLikes,
        };
      });
      
      setLikesCount((count) => alreadyLiked ? Math.max(0, count - 1) : count + 1);
      setIsLiked(!alreadyLiked);

      await toggleLike(post.id, currentUser.id);
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert local state on error
      setIsLiked((prev) => !prev);
      await loadPostDetail();
    }
  };

  const handleBookmark = async () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    try {
      await toggleBookmark(post.id, currentUser.id);
      setIsBookmarked((prev) => !prev);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await deletePost(post.id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const postComments = allComments.filter(
    (comment) => String(comment.postId) === String(post?.id ?? id)
  );
  const postBody = post.content.trim().length > 0 ? post.content : 'No content available.';
  const safeImage = post.image || 'https://picsum.photos/seed/post-fallback/1200/600';
  const createdAtLabel = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  const paragraphs = postBody.split('\n').filter((p) => p.trim().length > 0);
  const commentCountLabel = Math.max(post.commentCount ?? 0, postComments.length);

  const related = relatedPosts.length > 0
    ? relatedPosts
    : [
        {
          ...post,
          id: post.id + 100000,
          title: 'No related stories yet',
          description: 'New content from this category will appear here.',
          image: 'https://picsum.photos/seed/related-fallback/800/500',
          author: 'VibeBlog',
        },
      ];

  const handleCommentTextareaChange = (e) => {
    setCommentText(e.target.value);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <button
        onClick={handleBack}
        className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-emerald-500 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back</span>
      </button>

      <article className="space-y-8">
        <header className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={`/profile/${post.authorId}`}>
                <img src={post.authorAvatar} alt={post.authorName} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/20" />
              </Link>
              <div>
                <Link to={`/profile/${post.authorId}`} className="text-lg font-bold hover:text-emerald-500 transition-colors">
                  {post.authorName}
                </Link>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {createdAtLabel} • {ReadingTime < 1 ? 1 : ReadingTime} min read
                </p>
              </div>
            </div>

            {isAuthor && (
              <div className="flex items-center gap-2">
                <Link
                  to={`/edit/${post.id}`}
                  className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-emerald-500"
                >
                  <Edit3 size={20} />
                </Link>
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-zinc-500 hover:text-red-500"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            {post.title}
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed italic">
            {post.description}
          </p>
        </header>

        <div className="aspect-video rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl">
          <img src={safeImage} alt={post.title} className="w-full h-full object-cover" />
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none text-lg leading-relaxed space-y-6">
          {paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <footer className="pt-12 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-8">
              <button
                onClick={handleLike}
                className={cn(
                  "flex items-center gap-2 text-lg font-bold transition-all hover:scale-110",
                  isLiked ? "text-rose-500" : "text-zinc-500 hover:text-rose-500"
                )}
              >
                <Heart size={28} fill={isLiked ? "currentColor" : "none"} />
                <span>{likesCount}</span>
              </button>
              <button className="flex items-center gap-2 text-lg font-bold text-zinc-500 hover:text-emerald-500 transition-all hover:scale-110">
                <MessageCircle size={28} />
                <span>{commentCountLabel}</span>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleBookmark}
                className={cn(
                  "p-3 rounded-full transition-all hover:scale-110",
                  isBookmarked ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                <Bookmark size={24} fill={isBookmarked ? "currentColor" : "none"} />
              </button>
              <button className="p-3 rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all hover:scale-110">
                <Share2 size={24} />
              </button>
            </div>
          </div>

          <section id="comments" className="mt-12 space-y-8">
            <h3 className="text-2xl font-bold">Comments ({postComments.length})</h3>
            
            <form onSubmit={handleCommentSubmit} className="flex gap-4 items-start">
              <img src={currentUser?.avatar || 'https://picsum.photos/seed/guest/200'} alt="Your avatar" className="w-10 h-10 rounded-full object-cover shrink-0" />
              <div className="flex-1 space-y-4">
                <textarea
                  value={commentText}
                  onChange={handleCommentTextareaChange}
                  placeholder="Write a comment..."
                  className="w-full p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-25 resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black font-bold rounded-full transition-all flex items-center gap-2"
                  >
                    <Send size={18} /> Post Comment
                  </button>
                </div>
              </div>
            </form>

            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {postComments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800"
                  >
                    <img src={comment.authorAvatar} alt={comment.authorName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm">{comment.authorName}</span>
                        <span className="text-xs text-zinc-500">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          <section className="mt-20 space-y-8">
            <h3 className="text-2xl font-bold">Related Stories</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link key={p.id} to={`/post/${p.id}`} className="group space-y-3">
                  <div className="aspect-16/10 rounded-xl overflow-hidden">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h4 className="font-bold group-hover:underline transition-colors line-clamp-2">{p.title}</h4>
                  <p className="text-xs text-zinc-500">{p.authorName}</p>
                </Link>
              ))}
            </div>
          </section>
        </footer>
      </article>
    </motion.div>
  );
};

export default PostDetail;