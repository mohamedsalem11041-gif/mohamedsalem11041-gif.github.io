import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Windows path casing issue
import { Draggable } from 'gsap/dist/Draggable';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { useDocumentMeta, SEO_CONFIG } from '../hooks/useDocumentMeta';
import { useModalAnimation } from '../hooks/useModalAnimation';

gsap.registerPlugin(Draggable);

interface Cert {
  id: string;
  name: string;
  issuer: string | null;
  issue_date: string | null;
  expires_at: string | null;
  badge_url: string | null;
  verify_url: string | null;
  tags: string[];
  status: 'draft' | 'published';
  sort_order: number | null;
  created_at: string;
}

interface Badge {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  verify_url: string | null;
  status: 'draft' | 'published';
  sort_order: number | null;
  created_at: string;
}

interface SkillGroup {
  title: string;
  items: string[];
  accent: string;
  moreCount?: number;
  moreItems?: string[];
}

const PLACEHOLDER_BADGE =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" fill="%230f172a"/><circle cx="80" cy="80" r="44" fill="%231e293b"/><text x="50%" y="50%" fill="%23475569" font-size="12" text-anchor="middle" dy=".3em">Badge</text></svg>';

const PLACEHOLDER_CERT =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="120" viewBox="0 0 220 120"><rect width="220" height="120" fill="%230f172a"/><rect x="16" y="20" width="188" height="80" rx="12" fill="%231e293b"/><text x="50%" y="50%" fill="%23475569" font-size="12" text-anchor="middle" dy=".3em">Certification</text></svg>';

const skillGroups: SkillGroup[] = [
  {
    title: 'Cloud Platforms',
    items: ['AWS', 'EC2'],
    accent: 'sky',
    moreCount: 6,
    moreItems: ['S3', 'RDS', 'ECS', 'ECR', 'CloudFormation', 'Huawei Cloud'],
  },
  {
    title: 'DevOps & CI/CD',
    items: ['Docker', 'Kubernetes'],
    accent: 'amber',
    moreCount: 5,
    moreItems: ['Jenkins', 'GitHub Actions', 'Ansible', 'CodePipeline', 'Git'],
  },
  {
    title: 'Monitoring',
    items: ['CloudWatch', 'Prometheus'],
    accent: 'emerald',
    moreCount: 2,
    moreItems: ['Grafana', 'AWS Config'],
  },
  {
    title: 'Scripting & Systems',
    items: ['Python', 'Bash'],
    accent: 'purple',
    moreCount: 3,
    moreItems: ['Linux', 'YAML/JSON', 'CCNA Networking'],
  },
];

  const experienceTimeline = [
  {
    role: 'Cloud & DevOps Engineer Intern',
    company: 'Registfy (AWS Premier Partner)',
    period: 'Feb 2026 – Apr 2026 · Hybrid',
    description:
      'Trained as a Cloud & DevOps Engineer on AWS, designing scalable, highly available, fault-tolerant architectures following Well-Architected best practices. Built and maintained CI/CD pipelines, implemented CloudWatch monitoring and logging, used CloudFormation for Infrastructure as Code, and deployed containerized applications on Amazon ECS. Worked across EC2, S3, RDS, WAF, Load Balancer, Auto Scaling, Route 53, and Systems Manager.',
  },
];

const educationTimeline = [
  {
    program: "Bachelor's degree, Computer Science",
    school: 'Cairo University',
    period: 'Sep 2022 – Jul 2026 · Cairo, Egypt',
    description:
      'Information Technology major. Cumulative grade: Very Good. Graduation project: Excellent.',
  },
];

const SkillsExperience = () => {
  useDocumentMeta(SEO_CONFIG.skills);
  const [certs, setCerts] = useState<Cert[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<Cert | null>(null);
  const [isCertModalClosing, setIsCertModalClosing] = useState(false);

  // Certification gallery refs
  const certGalleryRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLUListElement>(null);
  const dragProxyRef = useRef<HTMLDivElement>(null);
  const seamlessLoopRef = useRef<gsap.core.Timeline | null>(null);
  const scrubRef = useRef<gsap.core.Tween | null>(null);
  const playheadRef = useRef({ offset: 0 });

  // Scroll to offset function for cert gallery (button/drag based, no scroll hijacking)
  const scrollToOffset = useCallback((offset: number) => {
    if (!seamlessLoopRef.current || !scrubRef.current) return;
    
    const spacing = 0.1;
    const snapTime = gsap.utils.snap(spacing);
    const snappedTime = snapTime(offset);
    
    // Update the scrub target
    scrubRef.current.vars.offset = snappedTime;
    scrubRef.current.invalidate().restart();
  }, []);

  // Initialize cert gallery animation (wheel event only when hovering over container)
  useEffect(() => {
    if (certs.length === 0 || loading) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReduced) return;

    const gallery = certGalleryRef.current;
    const cardsContainer = cardsRef.current;
    const dragProxy = dragProxyRef.current;
    
    if (!gallery || !cardsContainer || !dragProxy) return;

    const cards = gsap.utils.toArray<HTMLElement>(cardsContainer.querySelectorAll('li'));
    if (cards.length === 0) return;

    // Initial state
    gsap.set(cards, { xPercent: 400, opacity: 0, scale: 0 });

    const spacing = 0.1;

    // Animation function for each card
    const animateFunc = (element: HTMLElement) => {
      const tl = gsap.timeline();
      tl.fromTo(
        element,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, zIndex: 100, duration: 0.5, yoyo: true, repeat: 1, ease: 'power1.in', immediateRender: false }
      ).fromTo(
        element,
        { xPercent: 400 },
        { xPercent: -400, duration: 1, ease: 'none', immediateRender: false },
        0
      );
      return tl;
    };

    // Build seamless loop
    const buildSeamlessLoop = (items: HTMLElement[], spacing: number, animateFunc: (el: HTMLElement) => gsap.core.Timeline) => {
      const overlap = Math.ceil(1 / spacing);
      const startTime = items.length * spacing + 0.5;
      const loopTime = (items.length + overlap) * spacing + 1;
      const rawSequence = gsap.timeline({ paused: true });
      const seamlessLoop = gsap.timeline({
        paused: true,
        repeat: -1,
        onRepeat: function(this: gsap.core.Timeline) {
          const tl = this as gsap.core.Timeline & { _time: number; _dur: number; _tTime: number };
          if (tl._time === tl._dur) {
            tl._tTime += tl._dur - 0.01;
          }
        },
      });

      const l = items.length + overlap * 2;
      for (let i = 0; i < l; i++) {
        const index = i % items.length;
        const time = i * spacing;
        rawSequence.add(animateFunc(items[index]), time);
        if (i <= items.length) {
          seamlessLoop.addLabel('label' + i, time);
        }
      }

      rawSequence.time(startTime);
      seamlessLoop
        .to(rawSequence, {
          time: loopTime,
          duration: loopTime - startTime,
          ease: 'none',
        })
        .fromTo(
          rawSequence,
          { time: overlap * spacing + 1 },
          {
            time: startTime,
            duration: startTime - (overlap * spacing + 1),
            immediateRender: false,
            ease: 'none',
          }
        );

      return seamlessLoop;
    };

    const seamlessLoop = buildSeamlessLoop(cards, spacing, animateFunc);
    seamlessLoopRef.current = seamlessLoop;

    const playhead = playheadRef.current;
    playhead.offset = 0;

    const wrapTime = gsap.utils.wrap(0, seamlessLoop.duration());

    // Scrub tween - controls the seamless loop playhead
    const scrub = gsap.to(playhead, {
      offset: 0,
      onUpdate() {
        seamlessLoop.time(wrapTime(playhead.offset));
      },
      duration: 0.5,
      ease: 'power3',
      paused: true,
    });
    scrubRef.current = scrub;

    // Start at the first card position
    playhead.offset = 0;
    scrub.vars.offset = 0;
    scrub.invalidate().restart();

    // Draggable for touch/mouse drag
    const draggable = Draggable.create(dragProxy, {
      type: 'x',
      trigger: cardsContainer,
      onPress() {
        (this as Draggable & { startOffset: number }).startOffset = scrub.vars.offset as number;
      },
      onDrag() {
        const d = this as Draggable & { startOffset: number };
        scrub.vars.offset = d.startOffset + (d.startX - d.x) * 0.001;
        scrub.invalidate().restart();
      },
      onDragEnd() {
        scrollToOffset(scrub.vars.offset as number);
      },
    });

    // Wheel event - only triggers when mouse is over the gallery container
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault(); // Prevent page scroll when hovering over gallery
      
      const delta = e.deltaY > 0 ? 0.05 : -0.05; // Scroll down = next, scroll up = prev
      scrub.vars.offset = (scrub.vars.offset as number) + delta;
      scrub.invalidate().restart();
      
      // Snap after a short delay (debounced snapping)
      clearTimeout((handleWheel as { snapTimeout?: number }).snapTimeout);
      (handleWheel as { snapTimeout?: number }).snapTimeout = window.setTimeout(() => {
        scrollToOffset(scrub.vars.offset as number);
      }, 150);
    };

    gallery.addEventListener('wheel', handleWheel, { passive: false });

    // Cleanup
    return () => {
      gallery.removeEventListener('wheel', handleWheel);
      scrub.kill();
      seamlessLoop.kill();
      draggable.forEach((d) => d.kill());
    };
  }, [certs, loading, scrollToOffset]);

  // Handle prev/next buttons
  const handlePrev = useCallback(() => {
    if (scrubRef.current) {
      scrollToOffset((scrubRef.current.vars.offset as number) - 0.1);
    }
  }, [scrollToOffset]);

  const handleNext = useCallback(() => {
    if (scrubRef.current) {
      scrollToOffset((scrubRef.current.vars.offset as number) + 0.1);
    }
  }, [scrollToOffset]);

  const handleCertClick = useCallback((cert: Cert) => {
    setSelectedCert(cert);
    setIsCertModalClosing(false);
  }, []);

  const handleCloseCertModal = useCallback(() => {
    setIsCertModalClosing(true);
  }, []);

  const handleCertModalClosed = useCallback(() => {
    setSelectedCert(null);
    setIsCertModalClosing(false);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (!supabase) {
          throw new Error('Supabase client not configured');
        }

        const [certsResult, badgesResult] = await Promise.all([
          supabase
            .from('certs')
            .select('*')
            .eq('status', 'published')
            .order('sort_order', { ascending: true, nullsFirst: false })
            .order('issue_date', { ascending: false, nullsFirst: false }),
          supabase
            .from('badges')
            .select('*')
            .eq('status', 'published')
            .order('sort_order', { ascending: true, nullsFirst: false })
            .order('created_at', { ascending: false }),
        ]);

        if (certsResult.error) throw certsResult.error;
        if (badgesResult.error) throw badgesResult.error;

        setCerts(certsResult.data || []);
        setBadges(badgesResult.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load skills data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Duplicate certs for seamless loop (need enough items)
  const certItems = certs.length > 0 
    ? [...certs, ...certs, ...certs, ...certs].slice(0, Math.max(14, certs.length * 2))
    : [];

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10">
        <div className="pointer-events-none absolute -left-24 top-4 h-60 w-60 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-10 h-40 w-40 rounded-full bg-sky-400/15 blur-3xl" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Skills & Experience
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            Cloud, frontend, and security stack
          </h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            A view into the skills, values, roles, and certifications that shape how I build reliable experiences.
          </p>
        </div>
      </section>

      <section>
        <div className="space-y-16">
            {/* Skills Grid */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Skill groups</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Core competencies grouped by focus area.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {skillGroups.map((group) => (
                  <div
                    key={group.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <div
                      className={cn(
                        'mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em]',
                        group.accent === 'emerald' && 'bg-emerald-500/10 text-emerald-400',
                        group.accent === 'purple' && 'bg-purple-500/10 text-purple-400',
                        group.accent === 'sky' && 'bg-sky-500/10 text-sky-400',
                        group.accent === 'amber' && 'bg-amber-500/10 text-amber-400'
                      )}
                    >
                      {group.title}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-slate-200"
                        >
                          {item}
                        </span>
                      ))}
                      {group.moreCount && (
                        <div className="group relative inline-block">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
                            +{group.moreCount}
                          </span>
                          <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-44 -translate-x-1/2 rounded-lg border border-white/10 bg-black/80 px-3 py-2 text-[11px] text-slate-200 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                            {group.moreItems?.length ? group.moreItems.join(' • ') : 'More skills'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Values */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white">My values</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Principles that guide how I learn, collaborate, and ship.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { title: 'Curiosity', copy: 'Drives how I learn, explore problems, and ship solutions.' },
                  { title: 'Diverse knowledge', copy: 'Connects technical, strategic, and creative thinking for better outcomes.' },
                  { title: 'Growth mindset', copy: 'Iterating beyond comfort zones and inviting feedback on every build.' },
                ].map((value) => (
                  <div key={value.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm font-semibold text-white">{value.title}</div>
                    <p className="mt-2 text-sm text-slate-300">{value.copy}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience Timeline */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Experience timeline</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Roles that shaped my cloud, automation, and delivery mindset.
                </p>
              </div>

              <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
                <div className="absolute left-6 top-8 h-[calc(100%-4rem)] w-px bg-white/10 sm:left-8" />
                <div className="space-y-8">
                  {experienceTimeline.map((item) => (
                    <div
                      key={`${item.company}-${item.role}`}
                      className="relative pl-10 sm:pl-12"
                      data-timeline-item
                    >
                      <div className="absolute left-[18px] top-2 h-3 w-3 rounded-full bg-emerald-400 shadow-glow-sky sm:left-[26px]" />
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">
                          {item.role}
                        </h3>
                        <span className="text-sm text-slate-400">- {item.company}</span>
                        <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-400">
                          {item.period}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Education Timeline */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Education</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Formal studies that back up my work in cloud, security, and decision-making systems.
                </p>
              </div>

              <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
                <div className="absolute left-6 top-8 h-[calc(100%-4rem)] w-px bg-white/10 sm:left-8" />
                <div className="space-y-8">
                  {educationTimeline.map((item) => (
                    <div
                      key={`${item.school}-${item.program}`}
                      className="relative pl-10 sm:pl-12"
                    >
                      <div className="absolute left-[18px] top-2 h-3 w-3 rounded-full bg-sky-400 shadow-glow-sky sm:left-[26px]" />
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">
                          {item.program}
                        </h3>
                        <span className="text-sm text-slate-400">- {item.school}</span>
                        <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-400">
                          {item.period}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Certifications Card Gallery */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Certifications</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Hover and scroll, drag, or use buttons to explore. Click a card to verify.
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
                  {error}
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center h-[70vh]">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-56 w-44 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
                    <p className="text-sm text-slate-400">Loading certifications...</p>
                  </div>
                </div>
              )}

              {!loading && certs.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
                  No certifications published yet.
                </div>
              )}

              {!loading && certs.length > 0 && (
                <div 
                  ref={certGalleryRef}
                  className="cert-gallery relative w-full h-[50vh] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/80"
                >
                  {/* Background decoration */}
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
                    <div className="absolute right-10 bottom-1/4 h-48 w-48 rounded-full bg-sky-400/10 blur-3xl" />
                  </div>

                  {/* Cards container */}
                  <ul 
                    ref={cardsRef}
                    className="cert-cards absolute w-56 h-72 top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 list-none p-0 m-0"
                  >
                    {certItems.map((cert, index) => (
                      <li
                        key={`${cert.id}-${index}`}
                        className="cert-card absolute top-0 left-0 w-56 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-sm shadow-2xl cursor-pointer"
                        style={{ aspectRatio: '13/16' }}
                        onClick={() => handleCertClick(cert)}
                      >
                        <div className="group flex flex-col h-full p-4 transition hover:bg-white/5">
                          {/* Badge image */}
                          <div className="flex-1 flex items-center justify-center p-4">
                            <img
                              src={cert.badge_url || PLACEHOLDER_CERT}
                              alt={cert.name}
                              className="max-h-32 w-auto object-contain drop-shadow-lg transition-transform group-hover:scale-105"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = PLACEHOLDER_CERT;
                              }}
                            />
                          </div>
                          
                          {/* Card content */}
                          <div className="mt-auto space-y-2 text-center">
                            <h3 className="text-sm font-semibold text-white line-clamp-2">
                              {cert.name}
                            </h3>
                            <p className="text-xs text-slate-400 line-clamp-1">
                              {cert.issuer || 'Certification'}
                            </p>
                            {cert.issue_date && (
                              <p className="text-xs text-slate-500">
                                {formatDate(cert.issue_date)}
                              </p>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {/* Navigation buttons */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 hidden items-center gap-4 sm:flex">
                    <button
                      onClick={handlePrev}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white transition hover:bg-white/10 hover:border-white/20"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Prev
                    </button>
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white transition hover:bg-white/10 hover:border-white/20"
                    >
                      Next
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Drag proxy (invisible) */}
                  <div ref={dragProxyRef} className="invisible absolute" />
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="space-y-6 min-h-[60vh]">
              <div>
                <h2 className="text-xl font-semibold text-white">Badges</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Badges earned on credly!
                </p>
              </div>

              {loading && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-36 animate-pulse rounded-2xl border border-white/10 bg-white/5"
                    />
                  ))}
                </div>
              )}

              {!loading && badges.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
                  No badges published yet.
                </div>
              )}

              {!loading && badges.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {badges.map((badge, index) => (
                    <a
                      key={badge.id}
                      href={badge.verify_url || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative border-b border-white/10 pb-4 transition hover:text-emerald-200"
                      data-badge-float
                      style={{ zIndex: badges.length - index }}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={badge.image_url || PLACEHOLDER_BADGE}
                          alt={badge.name}
                          className="h-16 w-16 rounded-lg object-contain"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = PLACEHOLDER_BADGE;
                          }}
                        />
                        <div>
                          <p className="text-sm font-semibold text-white line-clamp-1">
                            {badge.name}
                          </p>
                          {badge.description && (
                            <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                              {badge.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="mt-4 inline-flex items-center text-xs text-emerald-400">
                        Verify badge
                        <svg
                          className="ml-1 h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
        </div>
      </section>

      {/* Certification Modal */}
      {selectedCert && (
        <CertModal
          cert={selectedCert}
          onClose={handleCloseCertModal}
          onClosed={handleCertModalClosed}
          isClosing={isCertModalClosing}
        />
      )}
    </div>
  );
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
}

function CertModal({
  cert,
  onClose,
  onClosed,
  isClosing,
}: {
  cert: Cert;
  onClose: () => void;
  onClosed: () => void;
  isClosing: boolean;
}) {
  const morphRef = useRef<SVGPathElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useModalAnimation({
    isClosing,
    onClosed,
    overlayRef: backdropRef,
    panelRef,
    morphRef,
  });

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto app-scroll">
      {/* Glassy Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-ink-900/65 backdrop-blur-[28px] backdrop-saturate-150"
        onClick={onClose}
        style={{ WebkitBackdropFilter: 'blur(28px)' }}
      >
        {/* Animated light effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -left-40 top-1/4 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
          <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-sky-400/15 blur-3xl animate-pulse [animation-delay:500ms]" />
        </div>
        {/* Morphing reveal layer */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="certMorphGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0.2" stopColor="rgba(16,185,129,0.25)" />
              <stop offset="0.8" stopColor="rgba(14,165,233,0.2)" />
            </linearGradient>
          </defs>
          <path
            ref={morphRef}
            d="M 0 100 L 100 100 L 100 100 L 0 100 Z"
            fill="url(#certMorphGrad)"
            style={{ transformOrigin: "50% 100%", transformBox: "fill-box" }}
          />
        </svg>
        {/* Glass texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent pointer-events-none" />
      </div>

      {/* Modal Container - Centered */}
      <div className="flex min-h-full items-center justify-center p-4 py-8 sm:p-6 sm:py-12">
        <div
          ref={panelRef}
          className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-ink-900/98 shadow-2xl backdrop-blur-sm overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 rounded-full bg-black/60 p-2.5 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/80 hover:text-white"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Certification Image */}
          <div className="relative bg-black/30 p-8 sm:p-12">
            <div className="flex items-center justify-center">
              <img
                src={cert.badge_url || PLACEHOLDER_CERT}
                alt={cert.name}
                className="max-h-[500px] max-w-full object-contain rounded-lg shadow-2xl"
                onError={(e) => {
                  e.currentTarget.src = PLACEHOLDER_CERT;
                }}
              />
            </div>
          </div>

          {/* Certification Details */}
          <div className="p-6 sm:p-8 bg-gradient-to-b from-ink-900/98 to-ink-950/98">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {cert.name}
            </h2>
            {cert.issuer && (
              <p className="text-lg text-slate-300 mb-4">
                Issued by {cert.issuer}
              </p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
              {cert.issue_date && (
                <div>
                  <span className="text-slate-500">Issued:</span>{' '}
                  <span className="text-white">{formatDate(cert.issue_date)}</span>
                </div>
              )}
              {cert.expires_at && (
                <div>
                  <span className="text-slate-500">Expires:</span>{' '}
                  <span className={new Date(cert.expires_at) < new Date() ? 'text-red-400' : 'text-white'}>
                    {formatDate(cert.expires_at)}
                  </span>
                </div>
              )}
            </div>
            {cert.tags && cert.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {cert.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {cert.verify_url && (
              <div className="mt-6">
                <a
                  href={cert.verify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Verify certification
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default SkillsExperience;

