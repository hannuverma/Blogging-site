export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  following: string[]; // User IDs
  followers: string[]; // User IDs
  muted: string[]; // User IDs
  reported: string[]; // User IDs
  bookmarks: string[]; // Post IDs
  location?: string;
  website?: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  content: string;
  image: string;
  category: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  published: boolean;
  createdAt: string;
  likes: string[]; // User IDs
  commentCount: number;
}

export type Theme = 'light' | 'dark';
