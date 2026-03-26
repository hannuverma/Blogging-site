import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBlog } from '../context/BlogContext';
import { UserPlus, UserMinus, MessageCircle, Heart, MoreHorizontal, Settings, MapPin, Calendar, Link as LinkIcon, EyeOff, Flag, Eye} from 'lucide-react';
import { format, set } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion'; // Using standard framer-motion
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from '../api';
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const ProfileSettingsModal = memo(function ProfileSettingsModal({
  open,
  editData,
  onClose,
  onFieldChange,
  onSubmit,
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white">Edit Profile</h2>
              
              <button onClick={onClose} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
                <MoreHorizontal size={20} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={onSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => onFieldChange('name', e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Bio</label>
                <textarea
                  value={editData.bio}
                  onChange={(e) => onFieldChange('bio', e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 min-h-25 resize-none dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Avatar URL</label>
                <input
                  type="text"
                  value={editData.avatar}
                  onChange={(e) => onFieldChange('avatar', e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Location</label>
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) => onFieldChange('location', e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Website</label>
                  <input
                    type="text"
                    value={editData.website}
                    onChange={(e) => onFieldChange('website', e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                
                className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl transition-all hover:scale-[1.02]"
              >
                Save Changes
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

const UserPostsSection = memo(function UserPostsSection({ userPosts }) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <h2 className="text-2xl font-bold dark:text-white">Published Stories</h2>
        <span className="text-sm font-bold text-zinc-500">{userPosts.length} stories</span>
      </div>

      <div className="space-y-8">
        {userPosts.map((post) => (
          <div key={post.id} className="group flex flex-col sm:flex-row gap-6">
            <Link to={`/post/${post.id}`} className="block w-full sm:w-48 aspect-video sm:aspect-square rounded-2xl overflow-hidden shrink-0">
              <img
                src={post.image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800'}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </Link>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-xs font-bold text-black dark:text-white uppercase tracking-widest mb-2">
                {format(new Date(post.createdAt), 'MMM d, yyyy')}
              </p>
              <Link to={`/post/${post.id}`}>
                <h3 className="text-xl font-bold mb-2 group-hover:underline transition-colors leading-tight line-clamp-2 dark:text-white">
                  {post.title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-2 mb-4">
                  {post.description}
                </p>
              </Link>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                  <Heart size={14} />
                  <span>{post.likes?.length || 0}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                  <MessageCircle size={14} />
                  <span>{post.commentCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {userPosts.length === 0 && (
          <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
            <p className="text-zinc-500 font-medium">No stories published yet.</p>
          </div>
        )}
      </div>
    </>
  );
});

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { users, posts, currentUser, toggleFollow, toggleMute, updateUser } = useBlog();
  const [fetchedUser, setFetchedUser] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [DeleteAccount, setDeleteAccount] = useState(false);
  const deleteAccount = useCallback( async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try{
        console.log("Attempting to delete account...");
        await api.delete('/api/users/delete/');
      }catch(err){
        alert("Error deleting account: " + (err.response?.data?.detail || err.message));
        return;
      }
      // On success:
      alert("Account deleted successfully.");
      // Redirect to home or login page
    }
  }, []);
  const [editData, setEditData] = useState({
    name: '',
    bio: '',
    avatar: '',
    location: '',
    website: ''
  });

    useEffect(() => {
    if (DeleteAccount) {
      deleteAccount();
    }
  }, [DeleteAccount, deleteAccount]);

    useEffect(() => {
      if (!userId) {
        setFetchedUser(null);
        return;
      }

      const relatedPost = posts.find((p) => String(p.authorId) === String(userId));
      if (!relatedPost?.id) {
        setFetchedUser(null);
        return;
      }

      let cancelled = false;
      (async () => {
        try {
          const res = await api.get('/api/posts/user/', {
            params: { postId: relatedPost.id },
          });

          const raw = res.data?.author;
          if (!raw || cancelled) return;

          setFetchedUser({
            id: String(raw.id ?? userId),
            name: raw.username ?? raw.name ?? `User ${userId}`,
            email: raw.email ?? '',
            avatar:
              raw.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(raw.username ?? raw.name ?? `User ${userId}`)}&background=0f172a&color=fff`,
            followers: Array.isArray(raw.followers) ? raw.followers.map((id) => String(id)) : [],
            following: Array.isArray(raw.following) ? raw.following.map((id) => String(id)) : [],
            muted: Array.isArray(raw.muted)
              ? raw.muted.map((id) => String(id))
              : Array.isArray(raw.mute)
              ? raw.mute.map((id) => String(id))
              : [],
            createdAt: raw.created_at ?? raw.createdAt ?? relatedPost.createdAt ?? new Date().toISOString(),
            bio: raw.bio ?? '',
            location: raw.location ?? '',
            website: raw.website ?? '',
          });
          console.log("Fetched user from posts:", raw);
        } catch (error) {
          if (!cancelled) setFetchedUser(null);
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [userId, users, posts]);

  const user = useMemo(() => {
    if (!userId) return currentUser;
    const existing = users.find((u) => String(u.id) === String(userId));
    return fetchedUser || existing;
  }, [users, userId, currentUser, fetchedUser]);

  const userPosts = useMemo(() => {
    if (!user) return [];
    return posts.filter(p => String(p.authorId) === String(user.id) && p.published);
  }, [posts, user]);

  const isOwnProfile = currentUser?.id === user?.id;

  const openSettings = useCallback(() => setShowSettings(true), []);
  const closeSettings = useCallback(() => setShowSettings(false), []);
  const handleFieldChange = useCallback((field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
    if (isOwnProfile && currentUser) {
      setEditData({
        name: currentUser.name || '',
        bio: currentUser.bio || '',
        avatar: currentUser.avatar || '',
        location: currentUser.location || '',
        website: currentUser.website || ''
      });
    }
  }, [isOwnProfile, currentUser]);

  const isFollowing = useMemo(
    () => currentUser?.following?.some((id) => String(id) === String(user?.id)) ?? false,
    [currentUser, user?.id]
  );

  const isMuted = useMemo(
    () => currentUser?.muted?.some((id) => String(id) === String(user?.id)) ?? false,
    [currentUser, user?.id]
  );

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    updateUser(editData);
    closeSettings();
  };

  const openConnections = useCallback(
    (section) => {
      const base = userId ? `/profile/${userId}/connections` : '/profile/connections';
      navigate(`${base}/${section}`);
      setShowMenu(false);
    },
    [navigate, userId]
  );

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold mb-4">User not found</h2>
        <Link to="/" className="text-emerald-500 hover:underline">Back to feed</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 sm:space-y-12">
      <header className="relative">
        <div className="h-48 md:h-64 bg-black dark:bg-white rounded-3xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-[2px]" />
        </div>

        <div className="px-3 sm:px-8 -mt-16 md:-mt-20 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-3xl object-cover border-4 border-white dark:border-black shadow-2xl"
              />
              {isOwnProfile && (
                <button 
                  onClick={openSettings}
                  className="absolute bottom-2 right-2 p-2 bg-white dark:bg-black rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Settings size={18} />
                </button>
              )}
            </div>
            <div className="pb-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-1 dark:text-white">{user.name}</h1>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">@{user.email?.split('@')[0]}</p>
            </div>
          </div>

          <div className="flex w-full sm:w-auto items-center gap-2 sm:gap-3 pb-2">
            {!isOwnProfile && currentUser && (
              <div className="flex flex-1 sm:flex-none items-center gap-2">
              <button
                onClick={() => toggleMute(user.id)}
                className={cn(
                  "px-4 sm:px-6 py-2.5 rounded-full font-bold transition-all flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base flex-1 sm:flex-none",
                  isMuted 
                    ? "bg-white dark:bg-black border border-black dark:border-white text-black dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800" 
                    : "bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
                )}
              >
                {isMuted ? <Eye size={18} /> : <EyeOff size={18} />}
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
              <button
                onClick={() => toggleFollow(user.id)}
                className={cn(
                  "px-4 sm:px-6 py-2.5 rounded-full font-bold transition-all flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base flex-1 sm:flex-none",
                  isFollowing 
                    ? "bg-white dark:bg-black border border-black dark:border-white text-black dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800" 
                    : "bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800  dark:hover:bg-zinc-200"
                )}
              >
                {isFollowing ? <UserMinus size={18} /> : <UserPlus size={18} />}
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
              </div>
            )}
            {isOwnProfile && (
              <button onClick={() => setShowMenu(!showMenu)} className="p-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-500">
                <MoreHorizontal size={20} />
              </button>
            )}

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
                        openConnections('followers');
                      }}
                      className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-green-300 "
                    >
                      All Followers
                    </button>
                     <button
                      onClick={() => {
                        openConnections('following');
                      }}
                      className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-blue-400 "
                    >
                      All Following
                    </button>
                    <button
                      onClick={() => {
                        openConnections('muted');
                      }}
                      className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-amber-500"
                    >
                      <EyeOff size={16} />
                      Muted Authors
                    </button>
                    <button
                      onClick={() => {
                        setDeleteAccount(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-red-500"
                    >
                      <Flag size={16} />
                      DELETE ACCOUNT
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <ProfileSettingsModal
        open={showSettings}
        editData={editData}
        onClose={closeSettings}
        onFieldChange={handleFieldChange}
        onSubmit={handleUpdateProfile}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <aside className="space-y-8">
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 dark:text-white">About</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-6">
              {user.bio || "No bio yet. This user is a bit mysterious."}
            </p>
            <div className="space-y-3">
              {user.location && (
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <MapPin size={16} />
                  <span>{user.location}</span>
                </div>
              )}
              {user.website && (
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <LinkIcon size={16} />
                  <a 
                    href={user.website.startsWith('http') ? user.website : `https://${user.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-black dark:text-white font-bold hover:underline"
                  >
                    {user.website}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <Calendar size={16} />
                <span>Joined {format(new Date(user.createdAt), 'MMM yyyy')}</span>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-black dark:text-white">{user.followers?.length || 0}</p>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Followers</p>
              </div>
              <div>
                <p className="text-2xl font-black dark:text-white">{user.following?.length || 0}</p>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Following</p>
              </div>
            </div>
          </section>
        </aside>

        <main className="lg:col-span-2 space-y-8">
          <UserPostsSection userPosts={userPosts} />
        </main>
      </div>
    </div>
  );
};

export default Profile;