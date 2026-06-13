"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Something went wrong");
                return;
            }

            router.push("/login?registered=true");
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
                    <img
                        src="/logo.jpg"
                        alt="Spendly"
                        className="w-14 h-14 rounded-2xl object-cover"
                    />
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white">Spendly</h1>
                        <p className="text-sm text-zinc-400 mt-1">Create your account</p>
                    </div>
                </div>

                <div className="h-px bg-white/10" />

                {error && (
                    <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-zinc-300">Name</label>
                        <input
                            type="text"
                            placeholder="Your full name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                            className="h-12 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-zinc-300">Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                            className="h-12 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-zinc-300">Password</label>
                        <input
                            type="password"
                            placeholder="Min 8 characters"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                            minLength={8}
                            className="h-12 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="h-12 rounded-xl bg-gradient-primary text-white font-semibold text-sm transition hover:opacity-90 disabled:opacity-60 mt-2"
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <div className="h-px bg-white/10" />

                <p className="text-center text-sm text-zinc-400">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary font-semibold hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
