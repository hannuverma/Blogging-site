import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark, Share2, ArrowLeft, Send, Trash2, Edit3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from '../api';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const normalizePost = (raw, commentsLen = 0) => ({
  id: Number(raw?.id ?? 0),
  title: raw?.title ?? 'Untitled story',
  description: raw?.description ?? 'No description provided yet.',
  content: raw?.content ?? 'No content available.',
  image: raw?.image || 'https://picsum.photos/seed/post-detail/1200/600',
  author_id: Number(raw?.author_id ?? 0),
  author: raw?.author ?? 'Unknown author',
  authorAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(raw?.author ?? 'Author')}&background=e2e8f0&color=0f172a`,
  createdAt: raw?.created_at ?? new Date().toISOString(),
  likes: Array.isArray(raw?.likes) ? raw.likes : [],
  commentCount: typeof raw?.comment_count === 'number' ? raw.comment_count : commentsLen,
  category: raw?.category ?? 'Other',
});

const normalizeComment = (raw) => ({
  id: Number(raw?.id ?? 0),
  postId: Number(raw?.post ?? 0),
  authorId: Number(raw?.author_id ?? 0),
  authorName: raw?.author ?? 'Anonymous',
  authorAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(raw?.author ?? 'Anonymous')}&background=f1f5f9&color=0f172a`,
  content: raw?.content ?? '',
  createdAt: raw?.created_at ?? new Date().toISOString(),
});

const PostDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [commentText, setCommentText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const fetchUser = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/whoami/');
      setCurrentUser({
        id: Number(res.data.id ?? 0),
        name: res.data.username,
        email: res.data.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(res.data.username)}&background=0f172a&color=fff`,
      });
    } catch (error) {
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostDetail = async () => {
    setLoading(true);
    if (!id) return;
    try {
      // Try to fetch published post first
      const res = await api.get(`/api/posts/${id}/`);
      const normalizedComments = Array.isArray(res.data?.comments)
        ? res.data.comments.map(normalizeComment)
        : [];
      const normalizedPost = normalizePost(res.data?.post, normalizedComments.length);
      setComments(normalizedComments);
      setPost(normalizedPost);
      setLikesCount(normalizedPost.likes.length);
      setIsLiked(false);
      setIsBookmarked(false);
    } catch (publishedError) {
      // If published post not found, try to fetch user's own post (including drafts)
      try {
        const res = await api.get(`/api/user/posts/${id}/`);
        const normalizedComments = Array.isArray(res.data?.comments)
          ? res.data.comments.map(normalizeComment)
          : [];
        const normalizedPost = normalizePost(res.data?.post, normalizedComments.length);
        setComments(normalizedComments);
        setPost(normalizedPost);
        setLikesCount(normalizedPost.likes.length);
        setIsLiked(false);
        setIsBookmarked(false);
      } catch (draftError) {
        console.error('Error fetching post detail:', draftError);
        setPost(null);
        setComments([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchRelatedPosts = async (current) => {
    try {
      const res = await api.get('/api/posts/');
      const normalized = Array.isArray(res.data)
        ? res.data.map((p) => normalizePost(p, 0))
        : [];

      const related = normalized
        .filter((p) => p.id !== current.id && (p.category === current.category || current.category === 'Other'))
        .slice(0, 3);

      setRelatedPosts(related);
    } catch (error) {
      console.error('Error fetching related posts:', error);
      setRelatedPosts([]);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) fetchUser();
    fetchPostDetail();
  }, [id]);

  useEffect(() => {
    if (post) {
      fetchRelatedPosts(post);
    }
  }, [post?.id]);

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold mb-4">Post not found</h2>
        <Link to="/" className="text-emerald-500 hover:underline flex items-center gap-2">
          <ArrowLeft size={20} /> Back to feed
        </Link>
      </div>
    );
  }

  const isAuthor = currentUser?.id === post.author_id;

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    (async () => {
      if (!currentUser) {
        navigate('/auth');
        return;
      }
      if (!commentText.trim()) return;

      try {
        const res = await api.post(`/api/posts/${post.id}/comments/create/`, {
          content: commentText,
        });
        const newComment = normalizeComment(res.data);
        setComments((prev) => [newComment, ...prev]);
        setPost((prev) => (prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev));
        setCommentText('');
      } catch (error) {
        console.error('Error creating comment:', error);
      }
    })();
  };

  const handleLike = () => {
    setIsLiked((prev) => {
      const next = !prev;
      setLikesCount((count) => (next ? count + 1 : Math.max(0, count - 1)));
      return next;
    });
  };

  const handleBookmark = () => {
    setIsBookmarked((prev) => !prev);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await api.delete(`/api/posts/${post.id}/delete/`);
      navigate('/');
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const postComments = comments;
  const postBody = post.content.trim().length > 0 ? post.content : 'No content available.';
  const safeImage = post.image || 'https://picsum.photos/seed/post-fallback/1200/600';
  const createdAtLabel = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  const paragraphs = postBody.split('\n').filter((p) => p.trim().length > 0);
  const commentCountLabel = post.commentCount ?? postComments.length;

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
              <Link to={`/profile/${post.author_id}`}>
                <img src={post.authorAvatar} alt={post.author} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/20" />
              </Link>
              <div>
                <Link to={`/profile/${post.author_id}`} className="text-lg font-bold hover:text-emerald-500 transition-colors">
                  {post.author}
                </Link>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {createdAtLabel} • 5 min read
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
                  <p className="text-xs text-zinc-500">{p.author}</p>
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