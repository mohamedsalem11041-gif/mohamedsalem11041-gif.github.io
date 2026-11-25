import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getSupabase } from '../lib/supabase';
import TiltCard from '../components/ui/TiltCard';
import { cn } from '../lib/utils';
import { useModalAnimation } from '../hooks/useModalAnimation';
import { useDocumentMeta, SEO_CONFIG } from '../hooks/useDocumentMeta';
import type { Database } from '../types/database.types';

type HobbiesRow = Database['public']['Tables']['hobbies']['Row'];

// Types
interface BlogPost {
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    content_md: string | null;
    cover_url: string | null;
    tags: string[];
    status: 'draft' | 'published';
    created_at: string;
    updated_at: string;
    published_at: string | null;
    og_image_url: string | null;
}

interface Hobby {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    media_urls: string[];
    tags: string[];
    status: 'draft' | 'published';
    created_at: string;
    updated_at: string;
}

type TabType = 'blog' | 'hobbies' | 'all';

// Placeholder image for hobbies
const PLACEHOLDER_MEDIA = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="%230f172a" width="400" height="400"/><text x="50%" y="50%" fill="%23475569" font-size="16" text-anchor="middle" dy=".3em">No Media</text></svg>';

export default function FunZone() {
    useDocumentMeta(SEO_CONFIG.blog);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('blog');
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [hobbies, setHobbies] = useState<Hobby[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Blog state
    const [blogModal, setBlogModal] = useState<{ post: BlogPost; closing: boolean } | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tagQuery, setTagQuery] = useState("");
    const [showAllTags, setShowAllTags] = useState(false);
    
    // Hobby state
    const [hobbyModal, setHobbyModal] = useState<{ hobby: Hobby; closing: boolean } | null>(null);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    // Get all unique tags
    const blogTags = Array.from(new Set(blogPosts.flatMap((p) => p.tags || []))).sort();
    const hobbyTags = Array.from(new Set(hobbies.flatMap((h) => h.tags || []))).sort();
    const allTags = Array.from(new Set([...blogTags, ...hobbyTags])).sort();

    // Filter by selected tags
    const filteredBlogPosts = selectedTags.length === 0
        ? blogPosts
        : blogPosts.filter((p) => selectedTags.some((tag) => p.tags?.includes(tag)));
    
    const filteredHobbies = selectedTags.length === 0
        ? hobbies
        : hobbies.filter((h) => selectedTags.some((tag) => h.tags?.includes(tag)));

    const activePost = blogModal?.post ?? null;
    const activeHobby = hobbyModal?.hobby ?? null;
    const isBlogClosing = blogModal?.closing ?? false;
    const isHobbyClosing = hobbyModal?.closing ?? false;

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        setShowAllTags(false);
        setTagQuery("");
    }, [activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            
            const [blogResult, hobbiesResult] = await Promise.all([
                getSupabase()
                    .from('blog_posts')
                    .select('*')
                    .eq('status', 'published')
                    .order('published_at', { ascending: false }),
                getSupabase()
                    .from('hobbies')
                    .select('*')
                    .eq('status', 'published')
                    .order('created_at', { ascending: false })
            ]);

            if (blogResult.error) throw blogResult.error;
            if (hobbiesResult.error) throw hobbiesResult.error;

            setBlogPosts(blogResult.data || []);
            setHobbies(((hobbiesResult.data || []) as HobbiesRow[]).map((h) => ({
                ...h,
                media_urls: Array.isArray(h.media_urls) ? (h.media_urls as string[]) : []
            })));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load content');
        } finally {
            setLoading(false);
        }
    };

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const clearFilters = () => setSelectedTags([]);

    const openBlogPost = (post: BlogPost, useModal = false) => {
        if (useModal) {
            setBlogModal({ post, closing: false });
        } else {
            // Navigate to dedicated blog post page for better sharing/SEO
            navigate(`/blog/${post.slug}`);
        }
    };

    const closeBlogPost = useCallback(() => {
        setBlogModal((prev) => (prev ? { ...prev, closing: true } : prev));
    }, []);

    const handleBlogClosed = useCallback(() => {
        setBlogModal(null);
    }, []);

    const openHobby = (hobby: Hobby) => {
        setHobbyModal({ hobby, closing: false });
        setCurrentMediaIndex(0);
    };

    const closeHobby = useCallback(() => {
        setHobbyModal((prev) => (prev ? { ...prev, closing: true } : prev));
    }, []);

    const handleHobbyClosed = useCallback(() => {
        setHobbyModal(null);
        setCurrentMediaIndex(0);
    }, []);

    const nextMedia = useCallback(() => {
        if (!activeHobby) return;
        setCurrentMediaIndex((prev) =>
            prev === activeHobby.media_urls.length - 1 ? 0 : prev + 1
        );
    }, [activeHobby]);

    const prevMedia = useCallback(() => {
        if (!activeHobby) return;
        setCurrentMediaIndex((prev) =>
            prev === 0 ? activeHobby.media_urls.length - 1 : prev - 1
        );
    }, [activeHobby]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (activePost && e.key === 'Escape') closeBlogPost();
            if (activeHobby) {
                if (e.key === 'Escape') closeHobby();
                if (e.key === 'ArrowRight') nextMedia();
                if (e.key === 'ArrowLeft') prevMedia();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activePost, activeHobby, closeBlogPost, closeHobby, nextMedia, prevMedia]);

    const copyPermalink = (slug: string) => {
        const url = `${window.location.origin}/blog/${slug}`;
        navigator.clipboard.writeText(url);
    };

    // Get current tags based on active tab
    const currentTags = activeTab === 'blog' ? blogTags : activeTab === 'hobbies' ? hobbyTags : allTags;
    const normalizedTagQuery = tagQuery.trim().toLowerCase();
    const filteredTags = normalizedTagQuery.length > 0
        ? currentTags.filter((tag) => tag.toLowerCase().includes(normalizedTagQuery))
        : currentTags;
    const orderedTags = [
        ...filteredTags.filter((tag) => selectedTags.includes(tag)),
        ...filteredTags.filter((tag) => !selectedTags.includes(tag)),
    ];
    const visibleTags = showAllTags ? orderedTags : orderedTags.slice(0, 12);
    const hiddenTagCount = Math.max(0, orderedTags.length - visibleTags.length);

    return (
        <div className="space-y-8 pb-16">
            {/* Header */}
            <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10">
                <div className="pointer-events-none absolute -left-24 top-4 h-60 w-60 rounded-full bg-amber-500/20 blur-3xl" />
                <div className="pointer-events-none absolute right-10 top-10 h-40 w-40 rounded-full bg-purple-400/15 blur-3xl" />
                
                <div className="relative">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                        Fun Zone
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                        Blog & Hobbies
                    </h1>
                    <p className="mt-3 max-w-2xl text-slate-400">
                        Thoughts, tutorials, and personal interests. A space to share ideas and showcase what I love doing outside of work.
                    </p>
                </div>
            </section>

            {/* Tabs */}
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 w-fit">
                {(['blog', 'hobbies', 'all'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            'rounded-full px-5 py-2 text-sm font-medium transition-all',
                            activeTab === tab
                                ? 'bg-sky-500 text-white shadow-glow-sky'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        {tab === 'blog' ? 'Blog' : tab === 'hobbies' ? 'Hobbies' : 'All'}
                    </button>
                ))}
            </div>

            {/* Tag Filters */}
            {currentTags.length > 0 && (
                <section className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-sm font-medium text-slate-400">Filter by tags</h2>
                        <div className="flex items-center gap-3">
                            {hiddenTagCount > 0 && !showAllTags && (
                                <button
                                    onClick={() => setShowAllTags(true)}
                                    className="text-xs text-slate-400 transition-colors hover:text-slate-200"
                                >
                                    Show all ({hiddenTagCount})
                                </button>
                            )}
                            {showAllTags && hiddenTagCount > 0 && (
                                <button
                                    onClick={() => setShowAllTags(false)}
                                    className="text-xs text-slate-400 transition-colors hover:text-slate-200"
                                >
                                    Show fewer
                                </button>
                            )}
                            {selectedTags.length > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="w-full sm:max-w-xs">
                        <input
                            type="text"
                            value={tagQuery}
                            onChange={(e) => setTagQuery(e.target.value)}
                            placeholder="Search tags"
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white placeholder-slate-500 transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {visibleTags.length === 0 ? (
                            <span className="text-xs text-slate-500">No tags match your search.</span>
                        ) : (
                            visibleTags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={cn(
                                        'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                                        selectedTags.includes(tag)
                                            ? 'bg-sky-500 text-white shadow-glow-sky'
                                            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'
                                    )}
                                >
                                    {tag}
                                </button>
                            ))
                        )}
                    </div>
                </section>
            )}

            {/* Error State */}
            {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
                            <div className="aspect-video bg-white/5" />
                            <div className="p-5 space-y-3">
                                <div className="h-6 w-3/4 rounded bg-white/5" />
                                <div className="h-4 w-full rounded bg-white/5" />
                                <div className="h-4 w-2/3 rounded bg-white/5" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Blog Posts */}
            {!loading && (activeTab === 'blog' || activeTab === 'all') && (
                <section className="space-y-6">
                    {activeTab === 'all' && filteredBlogPosts.length > 0 && (
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                            Blog Posts
                        </h2>
                    )}
                    
                    {filteredBlogPosts.length === 0 ? (
                        <EmptyState 
                            title={selectedTags.length > 0 ? 'No matching posts' : 'No blog posts yet'}
                            description={selectedTags.length > 0 ? 'Try adjusting your filters.' : 'Blog posts will appear here once published.'}
                            onClear={selectedTags.length > 0 ? clearFilters : undefined}
                        />
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 -mx-2 px-2 py-2">
                            {filteredBlogPosts.map((post) => (
                                <BlogCard key={post.id} post={post} onClick={() => openBlogPost(post)} />
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* Hobbies */}
            {!loading && (activeTab === 'hobbies' || activeTab === 'all') && (
                <section className="space-y-6">
                    {activeTab === 'all' && filteredHobbies.length > 0 && (
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Hobbies
                        </h2>
                    )}
                    
                    {filteredHobbies.length === 0 ? (
                        activeTab === 'hobbies' && (
                            <EmptyState 
                                title={selectedTags.length > 0 ? 'No matching hobbies' : 'No hobbies yet'}
                                description={selectedTags.length > 0 ? 'Try adjusting your filters.' : 'Hobbies will appear here once published.'}
                                onClear={selectedTags.length > 0 ? clearFilters : undefined}
                            />
                        )
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 -mx-2 px-2 py-2">
                            {filteredHobbies.map((hobby) => (
                                <HobbyCard key={hobby.id} hobby={hobby} onClick={() => openHobby(hobby)} />
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* Blog Post Modal */}
            {activePost && (
                <BlogModal
                    post={activePost}
                    onClose={closeBlogPost}
                    onClosed={handleBlogClosed}
                    isClosing={isBlogClosing}
                    onCopyLink={copyPermalink}
                />
            )}

            {/* Hobby Modal */}
            {activeHobby && (
                <HobbyModal
                    hobby={activeHobby}
                    currentIndex={currentMediaIndex}
                    onClose={closeHobby}
                    onClosed={handleHobbyClosed}
                    isClosing={isHobbyClosing}
                    onNext={nextMedia}
                    onPrev={prevMedia}
                    onSelectIndex={setCurrentMediaIndex}
                />
            )}
        </div>
    );
}

// Empty State Component
function EmptyState({ title, description, onClear }: { title: string; description: string; onClear?: () => void }) {
    return (
        <div className="glass rounded-2xl p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-slate-400">{description}</p>
            {onClear && (
                <button onClick={onClear} className="mt-4 rounded-full bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-400 hover:bg-sky-500/20 transition-colors">
                    Clear filters
                </button>
            )}
        </div>
    );
}

// Estimate reading time from content
function getReadingTime(content: string | null): string {
    if (!content) return '1 min read';
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
}

// Blog Card Component - Clean, text-focused design with TiltCard
function BlogCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
    const readingTime = getReadingTime(post.content_md);
    
    return (
        <TiltCard 
            className="group cursor-pointer p-6"
            onClick={onClick}
            glowColor="amber"
        >
            {/* Top row: Date & Reading time */}
            <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                {post.published_at && (
                    <time dateTime={post.published_at} className="font-medium">
                        {new Date(post.published_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </time>
                )}
                <span className="flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {readingTime}
                </span>
            </div>

            {/* Primary tag */}
            {post.tags && post.tags.length > 0 && (
                <div className="mb-3">
                    <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400 ring-1 ring-inset ring-amber-500/20">
                        {post.tags[0]}
                    </span>
                </div>
            )}

            {/* Title */}
            <h3 className="text-xl font-bold text-white leading-snug group-hover:text-amber-400 transition-colors line-clamp-2 mb-3">
                {post.title}
            </h3>
            
            {/* Summary */}
            {post.summary && (
                <p className="text-sm text-slate-400 leading-relaxed line-clamp-3 mb-4">
                    {post.summary}
                </p>
            )}

            {/* Footer: Author & Read more */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center p-0.5">
                        <img src="/favicon-32x32.png" alt="" className="h-full w-full" />
                    </div>
                    <span className="text-xs text-slate-500">Mohamed Salem</span>
                </div>
                <span className="text-xs font-medium text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Read post
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </span>
            </div>

            {/* Additional tags (if more than 1) */}
            {post.tags && post.tags.length > 1 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                    {post.tags.slice(1, 4).map((tag) => (
                        <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-500">
                            {tag}
                        </span>
                    ))}
                    {post.tags.length > 4 && (
                        <span className="text-[10px] text-slate-600">+{post.tags.length - 4}</span>
                    )}
                </div>
            )}
        </TiltCard>
    );
}

// Hobby Card Component
function HobbyCard({ hobby, onClick }: { hobby: Hobby; onClick: () => void }) {
    const previewUrl = hobby.media_urls?.[0] || PLACEHOLDER_MEDIA;
    const isVideo = previewUrl.match(/\.(mp4|webm|mov)$/i);

    return (
        <TiltCard className="group cursor-pointer" onClick={onClick} glowColor="purple">
            {/* Preview */}
            <div className="aspect-square overflow-hidden bg-ink-900 relative">
                {isVideo ? (
                    <video
                        src={previewUrl}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                    />
                ) : (
                    <img
                        src={previewUrl}
                        alt={hobby.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = PLACEHOLDER_MEDIA; }}
                    />
                )}
                
                {/* Media count badge */}
                {hobby.media_urls.length > 1 && (
                    <div className="absolute top-3 right-3 rounded-full bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
                        {hobby.media_urls.length} items
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="text-base font-semibold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                    {hobby.title}
                </h3>
                
                {hobby.description && (
                    <p className="mt-1 text-sm text-slate-400 line-clamp-2">
                        {hobby.description}
                    </p>
                )}

                {/* Tags */}
                {hobby.tags && hobby.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                        {hobby.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs text-purple-400">
                                {tag}
                            </span>
                        ))}
                        {hobby.tags.length > 2 && (
                            <span className="text-xs text-slate-500">+{hobby.tags.length - 2}</span>
                        )}
                    </div>
                )}
            </div>
        </TiltCard>
    );
}

// Blog Modal Component - Enhanced with scroll lock and markdown rendering
function BlogModal({
    post,
    onClose,
    onClosed,
    isClosing,
    onCopyLink
}: {
    post: BlogPost;
    onClose: () => void;
    onClosed: () => void;
    isClosing: boolean;
    onCopyLink: (slug: string) => void;
}) {
    const [copied, setCopied] = useState(false);
    const morphRef = useRef<SVGPathElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    useModalAnimation({
        isClosing,
        onClosed,
        overlayRef: backdropRef,
        panelRef,
        morphRef
    });

    // Lock body scroll when modal is open
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        const originalPaddingRight = document.body.style.paddingRight;
        
        // Calculate scrollbar width to prevent layout shift
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        
        document.body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
        
        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.paddingRight = originalPaddingRight;
        };
    }, []);

    const handleCopy = () => {
        onCopyLink(post.slug);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        // Only close if clicking on the backdrop itself, not on the modal content
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return createPortal(
        <div 
            className="fixed inset-0 z-50 flex items-start justify-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="blog-modal-title"
        >
            {/* Backdrop - fixed, no scroll */}
            <div
                ref={backdropRef}
                className="fixed inset-0 bg-ink-900/80 backdrop-blur-[32px] backdrop-saturate-150"
                onClick={onClose}
                style={{ WebkitBackdropFilter: 'blur(32px)' }}
            >
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -left-40 top-1/4 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl animate-pulse" />
                    <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-purple-400/10 blur-3xl animate-pulse [animation-delay:500ms]" />
                </div>
                <svg
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id="blogMorphGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                            <stop offset="0.2" stopColor="rgba(251, 191, 36, 0.22)" />
                            <stop offset="0.8" stopColor="rgba(168, 85, 247, 0.2)" />
                        </linearGradient>
                    </defs>
                    <path
                        ref={morphRef}
                        d="M 0 100 L 100 100 L 100 100 L 0 100 Z"
                        fill="url(#blogMorphGrad)"
                        style={{ transformOrigin: "50% 100%", transformBox: "fill-box" }}
                    />
                </svg>
            </div>

            {/* Scrollable container for modal positioning */}
            <div 
                className="relative w-full h-full overflow-y-auto overscroll-contain"
                onClick={handleBackdropClick}
            >
                <div className="flex min-h-full items-start justify-center p-4 py-8 sm:p-6 sm:py-12">
                    <div
                        ref={panelRef}
                        className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-ink-900/98 shadow-2xl backdrop-blur-sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button - Sticky */}
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 z-20 rounded-full bg-black/60 p-2.5 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/80 hover:text-white"
                            aria-label="Close modal"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Cover Image */}
                        {post.cover_url && (
                            <div className="relative bg-black/30 rounded-t-2xl overflow-hidden">
                                <img
                                    src={post.cover_url}
                                    alt={post.title}
                                    className="w-full max-h-[280px] object-cover"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 to-transparent" />
                            </div>
                        )}

                        {/* Content Area */}
                        <div className="p-6 sm:p-8 lg:p-10">
                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-4">
                                {post.published_at && (
                                    <time dateTime={post.published_at}>
                                        {new Date(post.published_at).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </time>
                                )}
                                <span>·</span>
                                <span>By Mohamed Salem</span>
                            </div>

                            {/* Title */}
                            <h2 
                                id="blog-modal-title"
                                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight"
                            >
                                {post.title}
                            </h2>

                            {/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {post.tags.map((tag) => (
                                        <span 
                                            key={tag} 
                                            className="rounded-full bg-amber-500/10 px-3 py-1 text-sm text-amber-400 border border-amber-500/20"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Summary */}
                            {post.summary && (
                                <p className="mt-6 text-lg text-slate-300 leading-relaxed border-l-4 border-amber-500/50 pl-4 bg-amber-500/5 py-3 pr-4 rounded-r-lg">
                                    {post.summary}
                                </p>
                            )}

                            {/* Content with Markdown Rendering */}
                            {post.content_md && (
                                <div className="mt-8 blog-content">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            h1: ({ children }) => (
                                                <h1 className="text-2xl font-bold text-white mt-10 mb-4 first:mt-0">{children}</h1>
                                            ),
                                            h2: ({ children }) => (
                                                <h2 className="text-xl font-bold text-white mt-8 mb-3 pb-2 border-b border-white/10">{children}</h2>
                                            ),
                                            h3: ({ children }) => (
                                                <h3 className="text-lg font-semibold text-white mt-6 mb-2">{children}</h3>
                                            ),
                                            h4: ({ children }) => (
                                                <h4 className="text-base font-semibold text-slate-200 mt-5 mb-2">{children}</h4>
                                            ),
                                            p: ({ children }) => (
                                                <p className="text-slate-300 leading-relaxed mb-4 text-[15px]">{children}</p>
                                            ),
                                            a: ({ href, children }) => (
                                                <a
                                                    href={href}
                                                    target={href?.startsWith('http') ? '_blank' : undefined}
                                                    rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                                                    className="text-amber-400 hover:text-amber-300 underline underline-offset-2 decoration-amber-400/30 hover:decoration-amber-300/50 transition-colors"
                                                >
                                                    {children}
                                                </a>
                                            ),
                                            ul: ({ children }) => (
                                                <ul className="list-disc list-outside ml-6 mb-4 space-y-1.5 text-slate-300 text-[15px]">{children}</ul>
                                            ),
                                            ol: ({ children }) => (
                                                <ol className="list-decimal list-outside ml-6 mb-4 space-y-1.5 text-slate-300 text-[15px]">{children}</ol>
                                            ),
                                            li: ({ children }) => (
                                                <li className="pl-1">{children}</li>
                                            ),
                                            blockquote: ({ children }) => (
                                                <blockquote className="border-l-4 border-amber-500/50 bg-amber-500/5 pl-4 pr-4 py-3 my-4 rounded-r-lg italic text-slate-300">
                                                    {children}
                                                </blockquote>
                                            ),
                                            code: ({ className, children }) => {
                                                const isInline = !className;
                                                if (isInline) {
                                                    return (
                                                        <code className="bg-white/10 text-amber-300 px-1.5 py-0.5 rounded text-sm font-mono">
                                                            {children}
                                                        </code>
                                                    );
                                                }
                                                return (
                                                    <code className={`${className} text-sm`}>{children}</code>
                                                );
                                            },
                                            pre: ({ children }) => (
                                                <pre className="bg-ink-900 border border-white/10 rounded-xl p-4 my-4 overflow-x-auto text-sm">
                                                    {children}
                                                </pre>
                                            ),
                                            img: ({ src, alt }) => (
                                                <figure className="my-6">
                                                    <img
                                                        src={src}
                                                        alt={alt || ''}
                                                        className="rounded-xl border border-white/10 w-full"
                                                        loading="lazy"
                                                    />
                                                    {alt && (
                                                        <figcaption className="mt-2 text-center text-sm text-slate-500 italic">
                                                            {alt}
                                                        </figcaption>
                                                    )}
                                                </figure>
                                            ),
                                            hr: () => (
                                                <hr className="my-8 border-t border-white/10" />
                                            ),
                                            table: ({ children }) => (
                                                <div className="my-4 overflow-x-auto rounded-lg border border-white/10">
                                                    <table className="w-full text-sm">{children}</table>
                                                </div>
                                            ),
                                            thead: ({ children }) => (
                                                <thead className="bg-white/5 border-b border-white/10">{children}</thead>
                                            ),
                                            th: ({ children }) => (
                                                <th className="px-4 py-2 text-left font-semibold text-white">{children}</th>
                                            ),
                                            td: ({ children }) => (
                                                <td className="px-4 py-2 text-slate-300 border-t border-white/5">{children}</td>
                                            ),
                                            strong: ({ children }) => (
                                                <strong className="font-semibold text-white">{children}</strong>
                                            ),
                                            em: ({ children }) => (
                                                <em className="italic text-slate-200">{children}</em>
                                            ),
                                        }}
                                    >
                                        {post.content_md}
                                    </ReactMarkdown>
                                </div>
                            )}

                            {/* Footer Actions */}
                            <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <a
                                    href={`/blog/${post.slug}`}
                                    className="inline-flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300 transition-colors"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    Open full post
                                </a>
                                <button
                                    onClick={handleCopy}
                                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:border-amber-500/50 hover:bg-white/10"
                                >
                                    {copied ? (
                                        <>
                                            <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Link Copied!
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                            </svg>
                                            Share Post
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

// Hobby Modal Component
function HobbyModal({
    hobby,
    currentIndex,
    onClose,
    onClosed,
    isClosing,
    onNext,
    onPrev,
    onSelectIndex,
}: {
    hobby: Hobby;
    currentIndex: number;
    onClose: () => void;
    onClosed: () => void;
    isClosing: boolean;
    onNext: () => void;
    onPrev: () => void;
    onSelectIndex: (index: number) => void;
}) {
    const morphRef = useRef<SVGPathElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    useModalAnimation({
        isClosing,
        onClosed,
        overlayRef: backdropRef,
        panelRef,
        morphRef
    });

    const currentMedia = hobby.media_urls?.[currentIndex];
    const isVideo = currentMedia?.match(/\.(mp4|webm|mov)$/i);
    const hasMultiple = hobby.media_urls && hobby.media_urls.length > 1;

    return createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto app-scroll">
            {/* Backdrop */}
            <div
                ref={backdropRef}
                className="fixed inset-0 bg-ink-900/65 backdrop-blur-[28px] backdrop-saturate-150"
                onClick={onClose}
                style={{ WebkitBackdropFilter: 'blur(28px)' }}
            >
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -left-40 top-1/4 h-80 w-80 rounded-full bg-purple-500/15 blur-3xl animate-pulse" />
                    <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl animate-pulse [animation-delay:500ms]" />
                </div>
                <svg
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id="hobbyMorphGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                            <stop offset="0.2" stopColor="rgba(167, 139, 250, 0.22)" />
                            <stop offset="0.8" stopColor="rgba(56, 189, 248, 0.18)" />
                        </linearGradient>
                    </defs>
                    <path
                        ref={morphRef}
                        d="M 0 100 L 100 100 L 100 100 L 0 100 Z"
                        fill="url(#hobbyMorphGrad)"
                        style={{ transformOrigin: "50% 100%", transformBox: "fill-box" }}
                    />
                </svg>
            </div>

            {/* Modal Container */}
            <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
                <div
                    ref={panelRef}
                    className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-ink-900/95 shadow-2xl backdrop-blur-sm"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Media */}
                    {hobby.media_urls && hobby.media_urls.length > 0 && (
                        <div className="relative bg-black/50">
                            <div className="flex items-center justify-center" style={{ maxHeight: '500px' }}>
                                {isVideo ? (
                                    <video
                                        src={currentMedia}
                                        className="max-h-[500px] max-w-full"
                                        controls
                                        autoPlay
                                        muted
                                    />
                                ) : (
                                    <img
                                        src={currentMedia || PLACEHOLDER_MEDIA}
                                        alt={hobby.title}
                                        className="max-h-[500px] max-w-full object-contain"
                                        onError={(e) => { e.currentTarget.src = PLACEHOLDER_MEDIA; }}
                                    />
                                )}
                            </div>

                            {/* Navigation */}
                            {hasMultiple && (
                                <>
                                    <button
                                        onClick={onPrev}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={onNext}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </>
                            )}

                            {/* Indicators */}
                            {hasMultiple && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    {hobby.media_urls.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => onSelectIndex(index)}
                                            className={cn(
                                                'h-2 w-2 rounded-full transition-all',
                                                index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'
                                            )}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-6 sm:p-8">
                        <h2 className="text-2xl font-bold text-white">
                            {hobby.title}
                        </h2>

                        {/* Tags */}
                        {hobby.tags && hobby.tags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {hobby.tags.map((tag) => (
                                    <span key={tag} className="rounded-full bg-purple-500/10 px-3 py-1 text-sm text-purple-400">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        {hobby.description && (
                            <p className="mt-4 text-slate-300">
                                {hobby.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
