import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/admin';
import { getSupabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

interface Stats {
    projects: { total: number; published: number; draft: number };
    graphics: { total: number; published: number; draft: number };
    reels: { total: number; published: number; draft: number };
    blogPosts: { total: number; published: number; draft: number };
    hobbies: { total: number; published: number; draft: number };
    certs: { total: number; published: number; draft: number };
    badges: { total: number; published: number; draft: number };
    contactSubmissions: number;
}

interface AdminStatus {
    isInUsersTable: boolean;
    userRecord: { id: string; email: string; role: string } | null;
}

const statCards = [
    { key: 'projects', label: 'Projects', icon: ProjectsIcon, path: '/admin/projects', color: 'sky' },
    { key: 'graphics', label: 'Graphics', icon: GraphicsIcon, path: '/admin/graphics', color: 'purple' },
    { key: 'reels', label: 'Reels', icon: ReelsIcon, path: '/admin/reels', color: 'pink' },
    { key: 'blogPosts', label: 'Blog Posts', icon: BlogIcon, path: '/admin/blog', color: 'amber' },
    { key: 'hobbies', label: 'Hobbies', icon: HobbiesIcon, path: '/admin/hobbies', color: 'emerald' },
    { key: 'certs', label: 'Certifications', icon: CertsIcon, path: '/admin/certs', color: 'cyan' },
    { key: 'badges', label: 'Badges', icon: BadgesIcon, path: '/admin/badges', color: 'orange' },
] as const;

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);

    const checkAdminStatus = useCallback(async () => {
        if (!user) return;
        
        try {
            // Try to read the user's own record from users table
            const { data, error } = await getSupabase()
                .from('users')
                .select('id, email, role')
                .eq('id', user.id)
                .single();
            
            if (error && error.code !== 'PGRST116') {
                console.log('Admin check error:', error);
            }
            
            setAdminStatus({
                isInUsersTable: !!data,
                userRecord: data
            });
        } catch (err) {
            console.log('Error checking admin status:', err);
        }
    }, [user]);

    const loadStats = useCallback(async () => {
        try {
            setLoading(true);
            const data = await dashboardService.getStats();
            setStats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load statistics');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStats();
        checkAdminStatus();
    }, [user, loadStats, checkAdminStatus]);

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; text: string; iconBg: string }> = {
            sky: { bg: 'bg-sky-500/10', text: 'text-sky-400', iconBg: 'bg-sky-500/20' },
            purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', iconBg: 'bg-purple-500/20' },
            pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', iconBg: 'bg-pink-500/20' },
            amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', iconBg: 'bg-amber-500/20' },
            emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', iconBg: 'bg-emerald-500/20' },
            cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', iconBg: 'bg-cyan-500/20' },
            orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', iconBg: 'bg-orange-500/20' },
        };
        return colors[color] || colors.sky;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="mt-2 text-slate-400">
                    Welcome back, <span className="text-sky-400">{user?.email}</span>
                </p>
            </div>

            {/* Error State */}
            {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400">
                    {error}
                </div>
            )}

            {/* Admin Setup Required */}
            {adminStatus && !adminStatus.isInUsersTable && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
                            <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-amber-400">Admin Setup Required</h3>
                            <p className="mt-2 text-sm text-amber-200/80">
                                Your account is authenticated but not registered as an admin in the database. 
                                This is required for Row Level Security (RLS) policies to work.
                            </p>
                            <div className="mt-4 rounded-lg bg-black/20 p-4">
                                <p className="text-xs font-medium text-slate-400 mb-2">Your Auth User ID:</p>
                                <code className="text-sm text-sky-400 break-all">{user?.id}</code>
                            </div>
                            <div className="mt-4 space-y-3">
                                <p className="text-sm font-medium text-amber-300">Run this SQL in Supabase Dashboard → SQL Editor:</p>
                                <div className="rounded-lg bg-black/30 p-3 overflow-x-auto">
                                    <code className="text-sm text-sky-400 whitespace-nowrap">
                                        INSERT INTO users (id, email, role) VALUES ('{user?.id}', '{user?.email}', 'admin');
                                    </code>
                                </div>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`INSERT INTO users (id, email, role) VALUES ('${user?.id}', '${user?.email}', 'admin');`);
                                    }}
                                    className="inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/20"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copy SQL
                                </button>
                                <p className="text-xs text-slate-500">
                                    After running the SQL, refresh this page.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Status OK */}
            {adminStatus?.isInUsersTable && (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-400 flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Admin access verified
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="glass rounded-xl p-6 animate-pulse">
                            <div className="h-10 w-10 rounded-lg bg-white/5"></div>
                            <div className="mt-4 h-8 w-16 rounded bg-white/5"></div>
                            <div className="mt-2 h-4 w-24 rounded bg-white/5"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Stats Grid */}
            {!loading && stats && (
                <>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {statCards.map((card) => {
                            const cardStats = stats[card.key as keyof Omit<Stats, 'contactSubmissions'>];
                            const colors = getColorClasses(card.color);

                            return (
                                <Link
                                    key={card.key}
                                    to={card.path}
                                    className="glass rounded-xl p-6 transition-all hover:border-white/10 hover:bg-white/[0.03] group"
                                >
                                    <div className={cn('inline-flex rounded-lg p-2.5', colors.iconBg)}>
                                        <card.icon className={cn('h-5 w-5', colors.text)} />
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-3xl font-bold text-white">
                                            {cardStats.total}
                                        </p>
                                        <p className="text-sm text-slate-400">{card.label}</p>
                                    </div>
                                    <div className="mt-3 flex items-center gap-3 text-xs">
                                        <span className="text-emerald-400">
                                            {cardStats.published} published
                                        </span>
                                        <span className="text-slate-500">|</span>
                                        <span className="text-amber-400">
                                            {cardStats.draft} draft
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}

                        {/* Messages Card */}
                        <Link
                            to="/admin/messages"
                            className="glass rounded-xl p-6 transition-all hover:border-white/10 hover:bg-white/[0.03] group"
                        >
                            <div className="inline-flex rounded-lg bg-rose-500/20 p-2.5">
                                <MessagesIcon className="h-5 w-5 text-rose-400" />
                            </div>
                            <div className="mt-4">
                                <p className="text-3xl font-bold text-white">
                                    {stats.contactSubmissions}
                                </p>
                                <p className="text-sm text-slate-400">Messages</p>
                            </div>
                            <div className="mt-3 text-xs text-slate-400">
                                Contact form submissions
                            </div>
                        </Link>
                    </div>

                    {/* Quick Actions */}
                    <div className="glass rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <QuickActionButton
                                to="/admin/projects"
                                label="New Project"
                                icon={
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                }
                            />
                            <QuickActionButton
                                to="/admin/blog"
                                label="New Blog Post"
                                icon={
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                }
                            />
                            <QuickActionButton
                                to="/admin/settings"
                                label="Edit Settings"
                                icon={
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                }
                            />
                            <QuickActionButton
                                to="/admin/messages"
                                label="View Messages"
                                icon={
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                }
                            />
                        </div>
                    </div>

                    {/* View Site Link */}
                    <div className="glass rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-white">Your Portfolio</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    View your live site to see how visitors experience it
                                </p>
                            </div>
                            <a
                                href="/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-600 to-sky-500 px-4 py-2 text-sm font-medium text-white transition-all hover:from-sky-500 hover:to-sky-400"
                            >
                                View Site
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// Quick Action Button Component
function QuickActionButton({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
    return (
        <Link
            to={to}
            className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 transition-all hover:border-sky-500/50 hover:bg-sky-500/10 hover:text-white"
        >
            {icon}
            {label}
        </Link>
    );
}

// Icon Components
function ProjectsIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
    );
}

function GraphicsIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    );
}

function ReelsIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    );
}

function BlogIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
    );
}

function HobbiesIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

function CertsIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
    );
}

function BadgesIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
    );
}

function MessagesIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    );
}
