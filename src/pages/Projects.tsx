import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getSupabase } from '../lib/supabase';
import TiltCard from '../components/ui/TiltCard';
import { cn } from '../lib/utils';
import { useModalAnimation } from '../hooks/useModalAnimation';
import { useDocumentMeta, SEO_CONFIG } from '../hooks/useDocumentMeta';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGsap } from '../hooks/useGsap';
import type { Database } from '../types/database.types';

type ProjectsRow = Database['public']['Tables']['projects']['Row'];

interface ImageItem {
    url: string;
    alt?: string;
}

interface Project {
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    description_md: string | null;
    demo_url: string | null;
    code_url: string | null;
    tags: string[];
    images: ImageItem[];
    status: 'draft' | 'published';
    created_at: string;
    updated_at: string;
    published_at: string | null;
}

export default function Projects() {
    useDocumentMeta(SEO_CONFIG.projects);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [projectModal, setProjectModal] = useState<{ project: Project; closing: boolean } | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Get all unique tags from projects
    const allTags = Array.from(
        new Set(projects.flatMap((p) => p.tags || []))
    ).sort();

    // Filter projects by selected tags
    const filteredProjects = selectedTags.length === 0
        ? projects
        : projects.filter((p) =>
            selectedTags.some((tag) => p.tags?.includes(tag))
        );
    const selectedProject = projectModal?.project ?? null;
    const isProjectClosing = projectModal?.closing ?? false;

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const { data, error } = await getSupabase()
                .from('projects')
                .select('*')
                .eq('status', 'published')
                .order('published_at', { ascending: false });

            if (error) throw error;

            // Parse images JSON if needed
            const parsedProjects = ((data || []) as ProjectsRow[]).map((p) => ({
                ...p,
                images: Array.isArray(p.images) ? (p.images as unknown as ImageItem[]) : [],
            }));

            setProjects(parsedProjects);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag)
                ? prev.filter((t) => t !== tag)
                : [...prev, tag]
        );
    };

    const clearFilters = () => {
        setSelectedTags([]);
    };

    const openModal = (project: Project) => {
        setProjectModal({ project, closing: false });
        setCurrentImageIndex(0);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = useCallback(() => {
        setProjectModal((prev) => (prev ? { ...prev, closing: true } : prev));
    }, []);

    const handleModalClosed = useCallback(() => {
        setProjectModal(null);
        setCurrentImageIndex(0);
        document.body.style.overflow = '';
    }, []);

    const nextImage = useCallback(() => {
        if (!selectedProject) return;
        setCurrentImageIndex((prev) =>
            prev === selectedProject.images.length - 1 ? 0 : prev + 1
        );
    }, [selectedProject]);

    const prevImage = useCallback(() => {
        if (!selectedProject) return;
        setCurrentImageIndex((prev) =>
            prev === 0 ? selectedProject.images.length - 1 : prev - 1
        );
    }, [selectedProject]);

    // Keyboard navigation for modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!selectedProject) return;
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedProject, closeModal, nextImage, prevImage]);

    return (
        <div className="space-y-8 pb-16">
            {/* Header */}
            <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10">
                <div className="pointer-events-none absolute -left-24 top-4 h-60 w-60 rounded-full bg-sky-500/20 blur-3xl" />
                <div className="pointer-events-none absolute right-10 top-10 h-40 w-40 rounded-full bg-sky-400/15 blur-3xl" />

                <div className="relative">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
                        Build Gallery
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                        Projects & Experiments
                    </h1>
                    <p className="mt-3 max-w-2xl text-slate-400">
                        A collection of full-stack applications, cloud architectures, and open-source tools.
                        Each project represents a journey from concept to deployment.
                    </p>
                </div>
            </section>

            {/* Tag Filters */}
            {allTags.length > 0 && (
                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-slate-400">Filter by tags</h2>
                        {selectedTags.length > 0 && (
                            <button
                                onClick={clearFilters}
                                className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {allTags.map((tag) => (
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
                            <div className="aspect-video bg-white/5" />
                            <div className="p-5 space-y-3">
                                <div className="h-6 w-3/4 rounded bg-white/5" />
                                <div className="h-4 w-full rounded bg-white/5" />
                                <div className="h-4 w-2/3 rounded bg-white/5" />
                                <div className="flex gap-2 pt-2">
                                    <div className="h-6 w-16 rounded-full bg-white/5" />
                                    <div className="h-6 w-20 rounded-full bg-white/5" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredProjects.length === 0 && (
                <div className="glass rounded-2xl p-12 text-center">
                    <svg className="mx-auto h-16 w-16 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="mt-4 text-lg font-semibold text-white">
                        {selectedTags.length > 0 ? 'No matching projects' : 'No projects yet'}
                    </h3>
                    <p className="mt-2 text-slate-400">
                        {selectedTags.length > 0
                            ? 'Try adjusting your filters or clear them to see all projects.'
                            : 'Projects will appear here once published.'}
                    </p>
                    {selectedTags.length > 0 && (
                        <button
                            onClick={clearFilters}
                            className="mt-4 rounded-full bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-400 hover:bg-sky-500/20 transition-colors"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            )}

            {/* Projects Grid */}
            {!loading && !error && filteredProjects.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 -mx-2 px-2 py-2">
                    {filteredProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onClick={() => openModal(project)}
                        />
                    ))}
                </div>
            )}

            {/* Project Modal */}
            {selectedProject && (
                <ProjectModal
                    project={selectedProject}
                    currentImageIndex={currentImageIndex}
                    onClose={closeModal}
                    onClosed={handleModalClosed}
                    isClosing={isProjectClosing}
                    onNext={nextImage}
                    onPrev={prevImage}
                    onSelectImage={setCurrentImageIndex}
                />
            )}
        </div>
    );
}

// Project Card Component - Compact design with hover preview tooltip
function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
    const hasImages = project.images && project.images.length > 0;
    const coverImage = hasImages ? project.images[0].url : null;

    return (
        <div className="relative group/card">
            <TiltCard className="cursor-pointer p-5" onClick={onClick}>
                {/* Header: Title + Links indicator */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-white group-hover/card:text-sky-400 transition-colors line-clamp-2 flex-1">
                        {project.title}
                    </h3>
                    {/* Quick links indicators */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        {project.demo_url && (
                            <span className="h-6 w-6 flex items-center justify-center rounded-md bg-sky-500/10 text-sky-400" title="Has demo">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </span>
                        )}
                        {project.code_url && (
                            <span className="h-6 w-6 flex items-center justify-center rounded-md bg-white/5 text-slate-400" title="Has code">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </span>
                        )}
                        {hasImages && (
                            <span className="h-6 w-6 flex items-center justify-center rounded-md bg-purple-500/10 text-purple-400" title="Has images">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </span>
                        )}
                    </div>
                </div>

                {/* Summary */}
                {project.summary && (
                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-4">
                        {project.summary}
                    </p>
                )}

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {project.tags.slice(0, 4).map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs text-sky-400"
                            >
                                {tag}
                            </span>
                        ))}
                        {project.tags.length > 4 && (
                            <span className="text-xs text-slate-500 self-center">
                                +{project.tags.length - 4}
                            </span>
                        )}
                    </div>
                )}

                {/* Footer: View details prompt */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-xs text-slate-500">
                        {project.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-xs font-medium text-sky-400 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center gap-1">
                        View details
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </span>
                </div>
            </TiltCard>

            {/* Hover Preview Tooltip - shows on hover if has image */}
            {hasImages && coverImage && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 z-50 opacity-0 scale-95 pointer-events-none group-hover/card:opacity-100 group-hover/card:scale-100 transition-all duration-200 ease-out">
                    <div className="relative">
                        <div className="w-64 rounded-xl overflow-hidden border border-white/10 bg-ink-900 shadow-2xl shadow-black/50">
                            <img
                                src={coverImage}
                                alt={project.title}
                                className="w-full h-36 object-cover"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-transparent to-transparent" />
                            <div className="absolute bottom-2 left-3 right-3">
                                <p className="text-xs text-white/80 font-medium truncate">{project.title}</p>
                                {project.images && project.images.length > 1 && (
                                    <p className="text-[10px] text-slate-400">{project.images.length} images</p>
                                )}
                            </div>
                        </div>
                        {/* Arrow */}
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 rotate-45 bg-ink-900 border-r border-b border-white/10" />
                    </div>
                </div>
            )}
        </div>
    );
}


// ... (rest of the file until ProjectModal)

// Project Modal Component
function ProjectModal({
    project,
    currentImageIndex,
    onClose,
    onClosed,
    isClosing,
    onNext,
    onPrev,
    onSelectImage,
}: {
    project: Project;
    currentImageIndex: number;
    onClose: () => void;
    onClosed: () => void;
    isClosing: boolean;
    onNext: () => void;
    onPrev: () => void;
    onSelectImage: (index: number) => void;
}) {
    const morphRef = useRef<SVGPathElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    useModalAnimation({
        isClosing,
        onClosed,
        overlayRef: backdropRef,
        panelRef,
        morphRef
    });

    const hasImages = project.images && project.images.length > 0;
    const hasMultipleImages = hasImages && project.images.length > 1;
    const currentImage = hasImages ? project.images[currentImageIndex] : null;

    useGsap(() => {
        const content = contentRef.current;
        const imageContainer = imageContainerRef.current;

        // Only apply scroll animation if there are images
        if (!content || !imageContainer || !hasImages) return;

        ScrollTrigger.create({
            scroller: content,
            trigger: imageContainer,
            start: "top top",
            end: "+=400", // Animate over 400px of scrolling
            scrub: true,
            animation: gsap.to(imageContainer, {
                scale: 0.6,
                marginTop: 20,
                opacity: 0.8,
                borderRadius: "24px",
                ease: "none"
            })
        });

    }, [project.id, hasImages]); // Re-run if project changes or images status changes

    return createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto app-scroll">
            {/* Glassy Backdrop - Fixed to cover entire viewport */}
            <div
                ref={backdropRef}
                className="fixed inset-0 bg-ink-900/65 backdrop-blur-[28px] backdrop-saturate-150"
                onClick={onClose}
                style={{ WebkitBackdropFilter: 'blur(28px)' }}
            >
                {/* Animated light effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -left-40 top-1/4 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl animate-pulse" />
                    <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-sky-400/15 blur-3xl animate-pulse [animation-delay:500ms]" />
                    <div className="absolute left-1/3 -bottom-20 h-60 w-60 rounded-full bg-purple-500/10 blur-3xl animate-pulse [animation-delay:1000ms]" />
                </div>
                {/* Morphing reveal layer */}
                <svg
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id="projectMorphGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                            <stop offset="0.2" stopColor="rgba(14,165,233,0.25)" />
                            <stop offset="0.8" stopColor="rgba(99,102,241,0.2)" />
                        </linearGradient>
                    </defs>
                    <path
                        ref={morphRef}
                        d="M 0 100 L 100 100 L 100 100 L 0 100 Z"
                        fill="url(#projectMorphGrad)"
                        style={{ transformOrigin: "50% 100%", transformBox: "fill-box" }}
                    />
                </svg>
                {/* Glass texture overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent pointer-events-none" />
            </div>

            {/* Modal Container - Centered */}
            <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
                {/* Modal Content */}
                <div
                    ref={panelRef}
                    className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-ink-900/95 shadow-2xl shadow-black/50 backdrop-blur-sm"
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

                    {/* Scrollable Container */}
                    <div ref={contentRef} className="flex flex-col max-h-[85vh] overflow-y-auto app-scroll">
                        {/* Image Carousel - Only show if images exist */}
                        {hasImages && currentImage && (
                            <div ref={imageContainerRef} className="relative bg-black/50 flex-shrink-0 origin-top transform-gpu">
                                <div className="flex items-center justify-center p-4" style={{ maxHeight: '400px' }}>
                                    <img
                                        src={currentImage.url}
                                        alt={currentImage.alt || project.title}
                                        className="max-h-[380px] max-w-full object-contain rounded-lg shadow-lg"
                                        onError={(e) => { 
                                            // Hide the image container if it fails to load
                                            e.currentTarget.parentElement?.parentElement?.classList.add('hidden');
                                        }}
                                    />
                                </div>

                                {/* Navigation Arrows */}
                                {hasMultipleImages && (
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

                                {/* Image Indicators */}
                                {hasMultipleImages && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                        {project.images.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => onSelectImage(index)}
                                                className={cn(
                                                    'h-2 w-2 rounded-full transition-all',
                                                    index === currentImageIndex
                                                        ? 'bg-white w-6'
                                                        : 'bg-white/50 hover:bg-white/70'
                                                )}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 app-scroll">
                            <h2 className="text-2xl font-bold text-white sm:text-3xl">
                                {project.title}
                            </h2>

                            {/* Tags */}
                            {project.tags && project.tags.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {project.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-full bg-sky-500/10 px-3 py-1 text-sm text-sky-400"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Summary */}
                            {project.summary && (
                                <p className="mt-4 text-slate-300">
                                    {project.summary}
                                </p>
                            )}

                            {/* Description (Markdown) */}
                            {project.description_md && (
                                <div className="mt-6 prose prose-invert prose-sky max-w-none">
                                    <div className="rounded-xl bg-white/5 p-4 text-sm text-slate-300 whitespace-pre-wrap">
                                        {project.description_md}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-8 flex flex-wrap gap-3">
                                {project.demo_url && (
                                    <a
                                        href={project.demo_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-sky-400 hover:shadow-glow-sky"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        View Demo
                                    </a>
                                )}
                                {project.code_url && (
                                    <a
                                        href={project.code_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:border-sky-500/50 hover:bg-white/10"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                        View Code
                                    </a>
                                )}
                            </div>

                            {/* Published Date */}
                            {project.published_at && (
                                <p className="mt-6 text-xs text-slate-500">
                                    Published {new Date(project.published_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
