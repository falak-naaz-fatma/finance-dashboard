"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, WalletCards } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setSent(true);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#07080d] px-4 py-10 text-white">
            <div className="w-full max-w-md px-8 py-10 rounded-2xl border border-white/10 bg-[#0b0c12] shadow-lg flex flex-col gap-6">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                        <WalletCards className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white">FinTrack</h1>
                        <p className="text-sm text-zinc-400 mt-1">Reset your password</p>
                    </div>
                </div>

                <div className="h-px bg-white/10" />

                {sent ? (
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Mail className="w-8 h-8 text-success" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-lg font-semibold text-white">Check your email</h2>
                            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                                We sent a password reset link to{" "}
                                <span className="text-white font-medium">{email}</span>.
                                The link expires in 1 hour.
                            </p>
                        </div>
                        <Link
                            href="/login"
                            className="flex items-center gap-2 text-sm text-primary hover:underline font-medium mt-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to login
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-2">
                            <h2 className="text-lg font-semibold text-white">Forgot your password?</h2>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                Enter your email address and we will send you a link to reset your password.
                            </p>
                        </div>

                        {error && (
                            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-zinc-300">Email</label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-12 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="h-12 rounded-xl bg-gradient-primary text-white font-semibold text-sm transition hover:opacity-90 disabled:opacity-60"
                            >
                                {loading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>

                        <Link
                            href="/login"
                            className="flex items-center justify-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to login
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
