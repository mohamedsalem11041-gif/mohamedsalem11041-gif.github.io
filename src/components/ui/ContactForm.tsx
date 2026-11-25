
import { useState } from "react";
import { animate } from "animejs";
import { submitContactForm } from "../../services/contact";

export default function ContactForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");
        setErrorMessage("");

        try {
            await submitContactForm(formData);
            setStatus("success");
            setFormData({ name: "", email: "", message: "" });

            // Animate success message
            animate(".success-message", {
                translateY: [20, 0],
                opacity: [0, 1],
                duration: 800,
                ease: "outElastic(1, .8)",
            });

        } catch (error) {
            console.error(error);
            setStatus("error");
            setErrorMessage("Something went wrong. Please try again or email directly.");
        }
    };

    return (
        <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:p-5">
            {status === "success" ? (
                <div className="success-message flex min-h-[220px] flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">Message Sent!</h3>
                    <p className="mt-2 text-slate-300">
                        Thanks for reaching out. I'll get back to you as soon as possible.
                    </p>
                    <button
                        onClick={() => setStatus("idle")}
                        className="mt-5 rounded-full bg-white/10 px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-white/20"
                    >
                        Send another message
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-slate-300">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder-slate-500 transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-slate-300">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder-slate-500 transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                placeholder="john@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium text-slate-300">
                            Message
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            required
                            rows={3}
                            value={formData.message}
                            onChange={handleChange}
                            className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder-slate-500 transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                            placeholder="Tell me about your project..."
                        />
                    </div>

                    {status === "error" && (
                        <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-400">
                            {errorMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={status === "submitting"}
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-3 py-2 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-sky-400 hover:shadow-glow-sky active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {status === "submitting" ? (
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                        ) : (
                            <>
                                Send Message
                                <svg
                                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}
