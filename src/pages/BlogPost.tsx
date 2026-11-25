import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getSupabase } from '../lib/supabase';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

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

export default function BlogPostPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Dynamic SEO - will be updated once post loads
    useDocumentMeta({
        title: post?.title || 'Blog Post',
        description: post?.summary || 'Read this blog post on Mohamed Salem\'s portfolio.',
        ogType: 'article',
        ogImage: post?.og_image_url || post?.cover_url || undefined,
        canonicalPath: `/blog/${slug}`,
    });

    useEffect(() => {
        if (!slug) {
            setError('No post specified');
            setLoading(false);
            return;
        }
        loadPost(slug);
    }, [slug]);

    const loadPost = async (postSlug: string) => {
        try {
            setLoading(true);
            setError(null);
            
            const { data, error: fetchError } = await getSupabase()
                .from('blog_posts')
                .select('*')
                .eq('slug', postSlug)
                .eq('status', 'published')
                .single();

            if (fetchError) {
                if (fetchError.code === 'PGRST116') {
                    setError('Post not found');
                } else {
                    throw fetchError;
                }
                return;
            }

            setPost(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load post');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
                    <p className="text-slate-400">Loading post...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !post) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="mb-6">
                        <svg className="mx-auto h-16 w-16 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-3">
                        {error === 'Post not found' ? 'Post Not Found' : 'Something went wrong'}
                    </h1>
                    <p className="text-slate-400 mb-6">
                        {error === 'Post not found'
                            ? "The blog post you're looking for doesn't exist or has been removed."
                            : error || 'An unexpected error occurred while loading the post.'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-white/10"
                        >
                            Go Back
                        </button>
                        <Link
                            to="/blog"
                            className="rounded-full bg-sky-500 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-sky-400"
                        >
                            View All Posts
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <article className="pb-16">
            {/* Back navigation */}
            <nav className="mb-8">
                <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Blog
                </Link>
            </nav>

            {/* Hero Section */}
            <header className="mb-10">
                {/* Cover Image */}
                {post.cover_url && (
                    <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                        <img
                            src={post.cover_url}
                            alt={post.title}
                            className="w-full max-h-[400px] object-cover"
                        />
                    </div>
                )}

                {/* Meta info */}
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
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                    {post.title}
                </h1>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
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
                    <p className="text-lg sm:text-xl text-slate-300 leading-relaxed border-l-4 border-amber-500/50 pl-4">
                        {post.summary}
                    </p>
                )}
            </header>

            {/* Content */}
            {post.content_md && (
                <div className="blog-content prose prose-invert prose-lg max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            // Custom heading styles
                            h1: ({ children }) => (
                                <h1 className="text-3xl font-bold text-white mt-12 mb-6 first:mt-0">{children}</h1>
                            ),
                            h2: ({ children }) => (
                                <h2 className="text-2xl font-bold text-white mt-10 mb-4 pb-2 border-b border-white/10">{children}</h2>
                            ),
                            h3: ({ children }) => (
                                <h3 className="text-xl font-semibold text-white mt-8 mb-3">{children}</h3>
                            ),
                            h4: ({ children }) => (
                                <h4 className="text-lg font-semibold text-slate-200 mt-6 mb-2">{children}</h4>
                            ),
                            // Paragraphs
                            p: ({ children }) => (
                                <p className="text-slate-300 leading-relaxed mb-6">{children}</p>
                            ),
                            // Links
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
                            // Lists
                            ul: ({ children }) => (
                                <ul className="list-disc list-outside ml-6 mb-6 space-y-2 text-slate-300">{children}</ul>
                            ),
                            ol: ({ children }) => (
                                <ol className="list-decimal list-outside ml-6 mb-6 space-y-2 text-slate-300">{children}</ol>
                            ),
                            li: ({ children }) => (
                                <li className="pl-2">{children}</li>
                            ),
                            // Blockquote
                            blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-amber-500/50 bg-amber-500/5 pl-6 pr-4 py-4 my-6 rounded-r-lg italic text-slate-300">
                                    {children}
                                </blockquote>
                            ),
                            // Code blocks
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
                                <pre className="bg-ink-900 border border-white/10 rounded-xl p-4 my-6 overflow-x-auto text-sm">
                                    {children}
                                </pre>
                            ),
                            // Images
                            img: ({ src, alt }) => (
                                <figure className="my-8">
                                    <img
                                        src={src}
                                        alt={alt || ''}
                                        className="rounded-xl border border-white/10 w-full"
                                        loading="lazy"
                                    />
                                    {alt && (
                                        <figcaption className="mt-3 text-center text-sm text-slate-500 italic">
                                            {alt}
                                        </figcaption>
                                    )}
                                </figure>
                            ),
                            // Horizontal rule
                            hr: () => (
                                <hr className="my-10 border-t border-white/10" />
                            ),
                            // Tables
                            table: ({ children }) => (
                                <div className="my-6 overflow-x-auto rounded-lg border border-white/10">
                                    <table className="w-full text-sm">{children}</table>
                                </div>
                            ),
                            thead: ({ children }) => (
                                <thead className="bg-white/5 border-b border-white/10">{children}</thead>
                            ),
                            th: ({ children }) => (
                                <th className="px-4 py-3 text-left font-semibold text-white">{children}</th>
                            ),
                            td: ({ children }) => (
                                <td className="px-4 py-3 text-slate-300 border-t border-white/5">{children}</td>
                            ),
                            // Strong/Bold
                            strong: ({ children }) => (
                                <strong className="font-semibold text-white">{children}</strong>
                            ),
                            // Emphasis/Italic
                            em: ({ children }) => (
                                <em className="italic text-slate-200">{children}</em>
                            ),
                        }}
                    >
                        {post.content_md}
                    </ReactMarkdown>
                </div>
            )}

            {/* Footer / Share */}
            <footer className="mt-12 pt-8 border-t border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-sm text-slate-500">Enjoyed this post?</p>
                        <p className="text-slate-300">Share it with others who might find it useful.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCopyLink}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:border-amber-500/50 hover:bg-white/10"
                        >
                            {copied ? (
                                <>
                                    <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copy Link
                                </>
                            )}
                        </button>
                        <a
                            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:border-sky-500/50 hover:bg-white/10"
                        >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            Share
                        </a>
                    </div>
                </div>

                {/* Back to blog */}
                <div className="mt-8">
                    <Link
                        to="/blog"
                        className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-5 py-2.5 text-sm font-medium text-sky-400 transition-all hover:bg-sky-500/20"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        View All Posts
                    </Link>
                </div>
            </footer>
        </article>
    );
}
