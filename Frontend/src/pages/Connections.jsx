import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useBlog } from '../context/BlogContext';
import { Users, UserCheck, EyeOff } from 'lucide-react';

const SECTION_CONFIG = {
  followers: {
    title: 'Followers',
    icon: Users,
  },
  following: {
    title: 'Following',
    icon: UserCheck,
  },
  muted: {
    title: 'Muted Authors',
    icon: EyeOff,
  },
};

const toArrayOfStrings = (value) =>
  Array.isArray(value) ? value.map((id) => String(id)) : [];

const Connections = () => {
  const { userId, section = 'followers' } = useParams();
  const { users, posts, currentUser } = useBlog();

  const safeSection = SECTION_CONFIG[section] ? section : 'followers';

  const profileUser = useMemo(() => {
    if (!userId) return currentUser;
    return users.find((u) => String(u.id) === String(userId));
  }, [userId, currentUser, users]);

  const byPostAuthor = useMemo(() => {
    const map = new Map();
    posts.forEach((p) => {
      const id = String(p.authorId);
      if (!id || map.has(id)) return;
      map.set(id, {
        id,
        name: p.authorName || 'Unknown user',
        avatar:
          p.authorAvatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(p.authorName || 'User')}&background=f1f5f9&color=0f172a`,
      });
    });
    return map;
  }, [posts]);

  const connectionIds = useMemo(() => {
    if (!profileUser) return [];

    if (safeSection === 'followers') return toArrayOfStrings(profileUser.followers);
    if (safeSection === 'following') return toArrayOfStrings(profileUser.following);
    return toArrayOfStrings(profileUser.muted);
  }, [profileUser, safeSection]);

  const connectionUsers = useMemo(() => {
    return connectionIds.map((id) => {
      const fromUsers = users.find((u) => String(u.id) === String(id));
      if (fromUsers) {
        return {
          id: String(fromUsers.id),
          name: fromUsers.name || fromUsers.username || 'Unknown user',
          email: fromUsers.email || '',
          avatar:
            fromUsers.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(fromUsers.name || fromUsers.username || 'User')}&background=f1f5f9&color=0f172a`,
        };
      }

      const fromPosts = byPostAuthor.get(String(id));
      if (fromPosts) {
        return {
          ...fromPosts,
          email: '',
        };
      }

      return {
        id: String(id),
        name: `User ${id}`,
        email: '',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(`User ${id}`)}&background=f1f5f9&color=0f172a`,
      };
    });
  }, [connectionIds, users, byPostAuthor]);

  if (!profileUser) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold mb-4">User not found</h2>
        <Link to="/" className="text-emerald-500 hover:underline">
          Back to feed
        </Link>
      </div>
    );
  }

  const basePath = userId ? `/profile/${profileUser.id}/connections` : '/profile/connections';
  const CurrentIcon = SECTION_CONFIG[safeSection].icon;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="space-y-2">
        <Link to={userId ? `/profile/${profileUser.id}` : '/profile'} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          Back to profile
        </Link>
        <h1 className="text-3xl font-black tracking-tight dark:text-white">{profileUser.name || 'User'} Connections</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Browse followers, following, and muted authors.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          to={`${basePath}/followers`}
          className={`rounded-2xl border px-4 py-3 transition-colors ${
            safeSection === 'followers'
              ? 'border-black dark:border-white bg-zinc-100 dark:bg-zinc-800'
              : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900'
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Followers</p>
          <p className="text-xl font-black dark:text-white">{toArrayOfStrings(profileUser.followers).length}</p>
        </Link>
        <Link
          to={`${basePath}/following`}
          className={`rounded-2xl border px-4 py-3 transition-colors ${
            safeSection === 'following'
              ? 'border-black dark:border-white bg-zinc-100 dark:bg-zinc-800'
              : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900'
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Following</p>
          <p className="text-xl font-black dark:text-white">{toArrayOfStrings(profileUser.following).length}</p>
        </Link>
        <Link
          to={`${basePath}/muted`}
          className={`rounded-2xl border px-4 py-3 transition-colors ${
            safeSection === 'muted'
              ? 'border-black dark:border-white bg-zinc-100 dark:bg-zinc-800'
              : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900'
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Muted Authors</p>
          <p className="text-xl font-black dark:text-white">{toArrayOfStrings(profileUser.muted).length}</p>
        </Link>
      </div>

      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
          <CurrentIcon size={18} className="text-zinc-500" />
          <h2 className="text-lg font-bold dark:text-white">{SECTION_CONFIG[safeSection].title}</h2>
          <span className="text-sm text-zinc-500">({connectionUsers.length})</span>
        </div>

        {connectionUsers.length === 0 ? (
          <div className="p-10 text-center text-zinc-500">No users in this list yet.</div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {connectionUsers.map((item) => (
              <Link
                key={item.id}
                to={`/profile/${item.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700"
                />
                <div className="min-w-0">
                  <p className="font-bold truncate dark:text-white">{item.name}</p>
                  {item.email ? (
                    <p className="text-sm text-zinc-500 truncate">@{item.email.split('@')[0]}</p>
                  ) : (
                    <p className="text-sm text-zinc-500 truncate">ID: {item.id}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Connections;
