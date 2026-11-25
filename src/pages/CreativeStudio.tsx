import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getSupabase } from '../lib/supabase';
import TiltCard from '../components/ui/TiltCard';
import { cn } from '../lib/utils';
import { useModalAnimation } from '../hooks/useModalAnimation';
import { useDocumentMeta, SEO_CONFIG } from '../hooks/useDocumentMeta';
import type { Database } from '../types/database.types';

type GraphicsRow = Database['public']['Tables']['graphics']['Row'];

// Types
interface Graphic {
    id: string;
    title: string;
    slug: string;
    client: string | null;
    description: string | null;
    tags: string[];
    preview_url: string | null;
    asset_urls: string[];
    status: 'draft' | 'published';
    created_at: string;
    updated_at: string;
}

interface Reel {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    tags: string[];
    video_url: string;
    poster_url: string | null;
    duration: number | null;
    status: 'draft' | 'published';
    created_at: string;
    updated_at: string;
}

type TabType = 'graphics' | 'reels';

// Placeholders
const PLACEHOLDER_PREVIEW = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="%230f172a" width="400" height="400"/><text x="50%" y="50%" fill="%23475569" font-size="16" text-anchor="middle" dy=".3em">No Preview</text></svg>';

export default function CreativeStudio() {
    useDocumentMeta(SEO_CONFIG.studio);
    const [activeTab, setActiveTab] = useState<TabType>('graphics');
    const [graphics, setGraphics] = useState<Graphic[]>([]);
    const [reels, setReels] = useState<Reel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Modal states
    const [graphicModal, setGraphicModal] = useState<{ graphic: Graphic; closing: boolean } | null>(null);
    const [currentAssetIndex, setCurrentAssetIndex] = useState(0);

    // Get unique tags
    const graphicTags = Array.from(new Set(graphics.flatMap((g) => g.tags || []))).sort();
    const reelTags = Array.from(new Set(reels.flatMap((r) => r.tags || []))).sort();
    const currentTags = activeTab === 'graphics' ? graphicTags : reelTags;

    // Filter by tags
    const filteredGraphics = selectedTags.length === 0
        ? graphics
        : graphics.filter((g) => selectedTags.some((tag) => g.tags?.includes(tag)));

    const filteredReels = selectedTags.length === 0
        ? reels
        : reels.filter((r) => selectedTags.some((tag) => r.tags?.includes(tag)));

    const activeGraphic = graphicModal?.graphic ?? null;
    const isGraphicClosing = graphicModal?.closing ?? false;

    useEffect(() => {
        loadData();
    }, []);

    // Clear tags when switching tabs
    useEffect(() => {
        setSelectedTags([]);
    }, [activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);

            const [graphicsResult, reelsResult] = await Promise.all([
                getSupabase()
                    .from('graphics')
                    .select('*')
                    .eq('status', 'published')
                    .order('created_at', { ascending: false }),
                getSupabase()
                    .from('reels')
                    .select('*')
                    .eq('status', 'published')
                    .order('created_at', { ascending: false })
            ]);

            if (graphicsResult.error) throw graphicsResult.error;
            if (reelsResult.error) throw reelsResult.error;

            setGraphics(((graphicsResult.data || []) as GraphicsRow[]).map((g) => ({
                ...g,
                asset_urls: Array.isArray(g.asset_urls) ? (g.asset_urls as string[]) : []
            })));
            setReels(reelsResult.data || []);
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

    const openGraphic = (graphic: Graphic) => {
        setGraphicModal({ graphic, closing: false });
        setCurrentAssetIndex(0);
        document.body.style.overflow = 'hidden';
    };

    const closeGraphic = useCallback(() => {
        setGraphicModal((prev) => (prev ? { ...prev, closing: true } : prev));
    }, []);

    const handleGraphicClosed = useCallback(() => {
        setGraphicModal(null);
        setCurrentAssetIndex(0);
        document.body.style.overflow = '';
    }, []);

    const nextAsset = useCallback(() => {
        if (!activeGraphic) return;
        const urls = activeGraphic.asset_urls.length > 0 ? activeGraphic.asset_urls : (activeGraphic.preview_url ? [activeGraphic.preview_url] : []);
        setCurrentAssetIndex((prev) => (prev === urls.length - 1 ? 0 : prev + 1));
    }, [activeGraphic]);

    const prevAsset = useCallback(() => {
        if (!activeGraphic) return;
        const urls = activeGraphic.asset_urls.length > 0 ? activeGraphic.asset_urls : (activeGraphic.preview_url ? [activeGraphic.preview_url] : []);
        setCurrentAssetIndex((prev) => (prev === 0 ? urls.length - 1 : prev - 1));
    }, [activeGraphic]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (activeGraphic) {
                if (e.key === 'Escape') closeGraphic();
                if (e.key === 'ArrowRight') nextAsset();
                if (e.key === 'ArrowLeft') prevAsset();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeGraphic, closeGraphic, nextAsset, prevAsset]);

    return (
        <div className="space-y-8 pb-16">
            {/* Header */}
            <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10">
                <div className="pointer-events-none absolute -left-24 top-4 h-60 w-60 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="pointer-events-none absolute right-10 top-10 h-40 w-40 rounded-full bg-pink-400/15 blur-3xl" />

                <div className="relative">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">
                        Creative Studio
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                        Graphics & Reels
                    </h1>
                    <p className="mt-3 max-w-2xl text-slate-400">
                        A showcase of visual design work and motion content. 
                        From brand identities to motion graphics and video reels.
                    </p>
                </div>
            </section>

            {/* Tabs */}
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 w-fit">
                <button
                    onClick={() => setActiveTab('graphics')}
                    className={cn(
                        'rounded-full px-5 py-2 text-sm font-medium transition-all',
                        activeTab === 'graphics'
                            ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                >
                    Graphic Design
                </button>
                <button
                    onClick={() => setActiveTab('reels')}
                    className={cn(
                        'rounded-full px-5 py-2 text-sm font-medium transition-all',
                        activeTab === 'reels'
                            ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/25'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                >
                    Reels
                </button>
            </div>

            {/* Tag Filters */}
            {currentTags.length > 0 && (
                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-slate-400">Filter by tags</h2>
                        {selectedTags.length > 0 && (
                            <button onClick={clearFilters} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                                Clear all
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {currentTags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={cn(
                                    'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                                    selectedTags.includes(tag)
                                        ? activeTab === 'graphics'
                                            ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                                            : 'bg-pink-500 text-white shadow-lg shadow-pink-500/25'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'
                                )}
                            >
                                {tag}
                            </button>
                        ))}
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
                            <div className="aspect-square bg-white/5" />
                            <div className="p-4 space-y-2">
                                <div className="h-5 w-3/4 rounded bg-white/5" />
                                <div className="h-4 w-1/2 rounded bg-white/5" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Graphics Tab */}
            {!loading && activeTab === 'graphics' && (
                <section>
                    {filteredGraphics.length === 0 ? (
                        <EmptyState
                            title={selectedTags.length > 0 ? 'No matching graphics' : 'No graphics yet'}
                            description={selectedTags.length > 0 ? 'Try adjusting your filters.' : 'Graphics will appear here once published.'}
                            onClear={selectedTags.length > 0 ? clearFilters : undefined}
                        />
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 -mx-2 px-2 py-2">
                            {filteredGraphics.map((graphic) => (
                                <GraphicCard key={graphic.id} graphic={graphic} onClick={() => openGraphic(graphic)} />
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* Reels Tab */}
            {!loading && activeTab === 'reels' && (
                <section>
                    {filteredReels.length === 0 ? (
                        <EmptyState
                            title={selectedTags.length > 0 ? 'No matching reels' : 'No reels yet'}
                            description={selectedTags.length > 0 ? 'Try adjusting your filters.' : 'Reels will appear here once published.'}
                            onClear={selectedTags.length > 0 ? clearFilters : undefined}
                        />
                    ) : (
                        <ReelsSection reels={filteredReels} />
                    )}
                </section>
            )}

            {/* Graphic Modal */}
            {activeGraphic && (
                <GraphicModal
                    graphic={activeGraphic}
                    currentIndex={currentAssetIndex}
                    onClose={closeGraphic}
                    onClosed={handleGraphicClosed}
                    isClosing={isGraphicClosing}
                    onNext={nextAsset}
                    onPrev={prevAsset}
                    onSelectIndex={setCurrentAssetIndex}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-slate-400">{description}</p>
            {onClear && (
                <button onClick={onClear} className="mt-4 rounded-full bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-400 hover:bg-purple-500/20 transition-colors">
                    Clear filters
                </button>
            )}
        </div>
    );
}

// Graphic Card Component
function GraphicCard({ graphic, onClick }: { graphic: Graphic; onClick: () => void }) {
    return (
        <TiltCard className="group cursor-pointer" onClick={onClick} glowColor="purple">
            {/* Preview */}
            <div className="aspect-square overflow-hidden bg-ink-900">
                <img
                    src={graphic.preview_url || PLACEHOLDER_PREVIEW}
                    alt={graphic.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER_PREVIEW; }}
                />
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="text-base font-semibold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                    {graphic.title}
                </h3>

                {graphic.client && (
                    <p className="mt-1 text-sm text-slate-500">
                        Client: {graphic.client}
                    </p>
                )}

                {graphic.description && (
                    <p className="mt-2 text-sm text-slate-400 line-clamp-2">
                        {graphic.description}
                    </p>
                )}

                {/* Tags */}
                {graphic.tags && graphic.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                        {graphic.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs text-purple-400">
                                {tag}
                            </span>
                        ))}
                        {graphic.tags.length > 3 && (
                            <span className="text-xs text-slate-500">+{graphic.tags.length - 3}</span>
                        )}
                    </div>
                )}

                {/* Asset count */}
                {graphic.asset_urls.length > 0 && (
                    <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {graphic.asset_urls.length} asset{graphic.asset_urls.length !== 1 ? 's' : ''}
                    </p>
                )}
            </div>
        </TiltCard>
    );
}

// Reels Section Component
function ReelsSection({ reels }: { reels: Reel[] }) {
    const [activeReelIndex, setActiveReelIndex] = useState(0);
    const [hasInteracted, setHasInteracted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div className="space-y-6">
            {/* Instructions */}
            <div className="text-center text-sm text-slate-400">
                <p>Tap to play/pause. Scroll or use arrows to navigate between reels.</p>
            </div>

            {/* Reels Container */}
            <div 
                ref={containerRef}
                className="relative mx-auto max-w-lg"
            >
                {/* Navigation Arrows */}
                <div className="absolute -left-14 top-1/2 -translate-y-1/2 hidden lg:block">
                    <button
                        onClick={() => setActiveReelIndex((prev) => Math.max(0, prev - 1))}
                        disabled={activeReelIndex === 0}
                        className="rounded-full bg-white/5 p-3 text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                </div>
                <div className="absolute -right-14 top-1/2 -translate-y-1/2 hidden lg:block">
                    <button
                        onClick={() => setActiveReelIndex((prev) => Math.min(reels.length - 1, prev + 1))}
                        disabled={activeReelIndex === reels.length - 1}
                        className="rounded-full bg-white/5 p-3 text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>

                {/* Reel Player */}
                <div className="glass rounded-2xl overflow-hidden">
                    <ReelPlayer
                        reel={reels[activeReelIndex]}
                        isActive={true}
                        shouldAutoplay={hasInteracted && activeReelIndex > 0}
                        onInteract={() => setHasInteracted(true)}
                    />
                </div>

                {/* Reel Info */}
                <div className="mt-4 px-2">
                    <h3 className="text-lg font-semibold text-white">
                        {reels[activeReelIndex].title}
                    </h3>
                    {reels[activeReelIndex].description && (
                        <p className="mt-1 text-sm text-slate-400">
                            {reels[activeReelIndex].description}
                        </p>
                    )}
                    {reels[activeReelIndex].tags && reels[activeReelIndex].tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {reels[activeReelIndex].tags.map((tag) => (
                                <span key={tag} className="rounded-full bg-pink-500/10 px-2 py-0.5 text-xs text-pink-400">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                    {reels[activeReelIndex].duration && (
                        <p className="mt-2 text-xs text-slate-500">
                            Duration: {formatDuration(reels[activeReelIndex].duration!)}
                        </p>
                    )}
                </div>

                {/* Reel Navigation Dots */}
                {reels.length > 1 && (
                    <div className="mt-6 flex justify-center gap-2">
                        {reels.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setActiveReelIndex(index);
                                    setHasInteracted(true);
                                }}
                                className={cn(
                                    'h-2 rounded-full transition-all',
                                    index === activeReelIndex
                                        ? 'w-6 bg-pink-500'
                                        : 'w-2 bg-white/30 hover:bg-white/50'
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {reels.length > 1 && (
                <div className="mt-8 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                    {reels.map((reel, index) => (
                        <button
                            key={reel.id}
                            onClick={() => {
                                setActiveReelIndex(index);
                                setHasInteracted(true);
                            }}
                            className={cn(
                                'relative aspect-[9/16] rounded-lg overflow-hidden transition-all',
                                index === activeReelIndex
                                    ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-ink-900'
                                    : 'opacity-60 hover:opacity-100'
                            )}
                        >
                            <img
                                src={reel.poster_url || PLACEHOLDER_PREVIEW}
                                alt={reel.title}
                                className="h-full w-full object-cover"
                                loading="lazy"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// Reel Player Component
function ReelPlayer({
    reel,
    isActive,
    shouldAutoplay,
    onInteract
}: {
    reel: Reel;
    isActive: boolean;
    shouldAutoplay: boolean;
    onInteract: () => void;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showPlayButton, setShowPlayButton] = useState(true);

    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isActive && shouldAutoplay) {
            video.play().then(() => {
                setIsPlaying(true);
                setShowPlayButton(false);
            }).catch(() => {
                // Autoplay blocked
                setShowPlayButton(true);
            });
        } else if (!isActive) {
            video.pause();
            video.currentTime = 0;
            setIsPlaying(false);
            setShowPlayButton(true);
        }
    }, [isActive, shouldAutoplay, reel.id]);
    /* eslint-enable react-hooks/set-state-in-effect */

    const handleClick = () => {
        const video = videoRef.current;
        if (!video) return;

        onInteract();

        if (isPlaying) {
            video.pause();
            setIsPlaying(false);
            setShowPlayButton(true);
        } else {
            video.play().then(() => {
                setIsPlaying(true);
                setShowPlayButton(false);
            }).catch(() => {
                setShowPlayButton(true);
            });
        }
    };

    return (
        <div 
            className="relative aspect-[9/16] bg-black cursor-pointer"
            onClick={handleClick}
        >
            <video
                ref={videoRef}
                src={reel.video_url}
                poster={reel.poster_url || undefined}
                className="h-full w-full object-contain"
                loop
                muted
                playsInline
                preload="metadata"
            />

            {/* Play/Pause Overlay */}
            {showPlayButton && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm transition-transform hover:scale-110">
                        <svg className="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
            )}

            {/* Paused indicator */}
            {!isPlaying && !showPlayButton && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="rounded-full bg-black/50 p-3 backdrop-blur-sm">
                        <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
}

// Graphic Modal Component
function GraphicModal({
    graphic,
    currentIndex,
    onClose,
    onClosed,
    isClosing,
    onNext,
    onPrev,
    onSelectIndex,
}: {
    graphic: Graphic;
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

    // Get all assets (fallback to preview_url if no assets)
    const assets = graphic.asset_urls.length > 0 ? graphic.asset_urls : (graphic.preview_url ? [graphic.preview_url] : []);
    const currentAsset = assets[currentIndex] || PLACEHOLDER_PREVIEW;
    const hasMultiple = assets.length > 1;

    return createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                ref={backdropRef}
                className="fixed inset-0 bg-ink-900/65 backdrop-blur-[28px] backdrop-saturate-150"
                onClick={onClose}
                style={{ WebkitBackdropFilter: 'blur(28px)' }}
            >
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -left-40 top-1/4 h-80 w-80 rounded-full bg-purple-500/15 blur-3xl animate-pulse" />
                    <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-pink-400/10 blur-3xl animate-pulse [animation-delay:500ms]" />
                </div>
                <svg
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id="graphicMorphGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                            <stop offset="0.2" stopColor="rgba(168, 85, 247, 0.22)" />
                            <stop offset="0.8" stopColor="rgba(236, 72, 153, 0.18)" />
                        </linearGradient>
                    </defs>
                    <path
                        ref={morphRef}
                        d="M 0 100 L 100 100 L 100 100 L 0 100 Z"
                        fill="url(#graphicMorphGrad)"
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

                    {/* Image */}
                    {assets.length > 0 && (
                        <div className="relative bg-black/50">
                            <div className="flex items-center justify-center p-4" style={{ maxHeight: '500px' }}>
                                <img
                                    src={currentAsset}
                                    alt={graphic.title}
                                    className="max-h-[480px] max-w-full object-contain rounded-lg"
                                    onError={(e) => { e.currentTarget.src = PLACEHOLDER_PREVIEW; }}
                                />
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
                                    {assets.map((_, index) => (
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
                            {graphic.title}
                        </h2>

                        {graphic.client && (
                            <p className="mt-2 text-slate-400">
                                <span className="text-slate-500">Client:</span> {graphic.client}
                            </p>
                        )}

                        {/* Tags */}
                        {graphic.tags && graphic.tags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {graphic.tags.map((tag) => (
                                    <span key={tag} className="rounded-full bg-purple-500/10 px-3 py-1 text-sm text-purple-400">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        {graphic.description && (
                            <p className="mt-4 text-slate-300">
                                {graphic.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

// Helper function
function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
