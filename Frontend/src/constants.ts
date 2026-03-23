import { Post, User } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    email: 'sarah@example.com',
    avatar: 'https://picsum.photos/seed/sarah/200',
    bio: 'Tech enthusiast and digital nomad. Writing about the future of AI and remote work.',
    following: ['2'],
    followers: ['3'],
    muted: [],
    reported: [],
    bookmarks: [],
  },
  {
    id: '2',
    name: 'Marcus Thorne',
    email: 'marcus@example.com',
    avatar: 'https://picsum.photos/seed/marcus/200',
    bio: 'Full-stack developer and coffee lover. Sharing tips on modern web development.',
    following: ['1'],
    followers: ['1', '3'],
    muted: [],
    reported: [],
    bookmarks: [],
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    email: 'elena@example.com',
    avatar: 'https://picsum.photos/seed/elena/200',
    bio: 'Graphic designer and minimalist. Exploring the intersection of art and technology.',
    following: ['1', '2'],
    followers: [],
    muted: [],
    reported: [],
    bookmarks: [],
  },
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'p1',
    title: 'The Rise of Generative AI in Creative Workflows',
    description: 'How AI is transforming the way designers and writers approach their daily tasks.',
    category: 'Technology',
    content: `Generative AI is no longer a futuristic concept; it's a present-day reality that is fundamentally reshaping creative industries. From generating initial design concepts to drafting long-form content, AI tools are becoming indispensable partners in the creative process.

In this post, we'll explore the various ways AI is being integrated into professional workflows, the ethical considerations that arise, and how creatives can adapt to this rapidly evolving landscape.

### The New Creative Partner
AI isn't replacing creativity; it's augmenting it. By handling repetitive tasks and providing instant inspiration, AI allows creators to focus on higher-level strategy and vision.

### Ethical Considerations
As we embrace these tools, we must also address questions of authorship, copyright, and the potential for bias in AI-generated content.`,
    image: 'https://picsum.photos/seed/ai-creative/1200/600',
    authorId: '1',
    authorName: 'Sarah Jenkins',
    authorAvatar: 'https://picsum.photos/seed/sarah/200',
    published: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    likes: ['2', '3'],
    commentCount: 12,
  },
  {
    id: 'p2',
    title: 'Mastering Tailwind CSS v4: What You Need to Know',
    description: 'A deep dive into the latest features and architectural changes in Tailwind CSS v4.',
    category: 'Development',
    content: `Tailwind CSS v4 is here, and it brings a host of exciting changes that make styling even more intuitive and powerful. With a new engine and improved performance, it's the most significant update to the framework yet.

Key features include:
- **Zero-runtime engine**: Faster builds and smaller CSS files.
- **Improved color palette**: More vibrant and consistent colors.
- **Native CSS variables**: Better integration with modern browser features.

Let's look at how you can migrate your existing projects and take full advantage of these new capabilities.`,
    image: 'https://picsum.photos/seed/tailwind/1200/600',
    authorId: '2',
    authorName: 'Marcus Thorne',
    authorAvatar: 'https://picsum.photos/seed/marcus/200',
    published: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    likes: ['1'],
    commentCount: 8,
  },
  {
    id: 'p3',
    title: 'The Art of Minimalist Living in a Digital Age',
    description: 'Finding balance and focus by simplifying your physical and digital environments.',
    category: 'Lifestyle',
    content: `In a world filled with constant notifications and digital clutter, minimalism offers a path to clarity and peace. It's not just about owning fewer things; it's about making room for what truly matters.

Digital minimalism involves:
- **Curating your feeds**: Only follow accounts that add value.
- **Setting boundaries**: Designate tech-free times and spaces.
- **Simplifying your tools**: Use fewer, more powerful apps.

By applying these principles, you can reclaim your attention and focus on your most important goals.`,
    image: 'https://picsum.photos/seed/minimalism/1200/600',
    authorId: '3',
    authorName: 'Elena Rodriguez',
    authorAvatar: 'https://picsum.photos/seed/elena/200',
    published: true,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    likes: ['1', '2'],
    commentCount: 5,
  },
];
