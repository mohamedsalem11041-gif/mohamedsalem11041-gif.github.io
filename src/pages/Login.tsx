
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getSupabase } from "../lib/supabase";
import { cn } from "../lib/utils";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/admin";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await getSupabase().auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            navigate(from, { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/5 bg-ink-800/50 p-8 shadow-2xl backdrop-blur-xl">
                <div className="text-center">
                    <h2 className="bg-gradient-to-r from-sky-400 to-ice-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
                        Admin Access
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Sign in to manage your portfolio
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="relative block w-full rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-slate-200 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="relative block w-full rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-slate-200 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-500/10 p-4 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            "group relative flex w-full justify-center rounded-lg bg-gradient-to-r from-sky-600 to-sky-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:from-sky-500 hover:to-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-ink-900",
                            loading && "opacity-70 cursor-wait"
                        )}
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
}
