"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            remember: false,
        },
    });

    // If already logged in, go to dashboard
    useEffect(() => {
        if (session) router.push("/dashboard");
    }, [session]);

    const onSubmit = async (data: LoginFormValues) => {
        setError(null);
        try {
            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
                callbackUrl: "/dashboard",
            });

            if (result?.error) {
                setError("Invalid email or password");
            } else if (result?.url) {
                router.push(result.url);
            }
        } catch (err) {
            setError("An error occurred during login");
            console.error("Login error:", err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#07080d] text-white">
            <Card className="w-full max-w-md shadow-lg border border-white/10 bg-[#0b0c12]">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-white">Finance Dashboard</CardTitle>
                    <CardDescription className="text-zinc-400">Track your income and expenses easily</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-300">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                {...register("email")}
                                className={`h-10 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none transition placeholder:text-zinc-400 focus:border-[#8b5cf6]/70 focus:ring-4 focus:ring-[#8b5cf6]/10 ${errors.email ? "border-red-500" : ""}`}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-400">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-zinc-300">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                {...register("password")}
                                className={`h-10 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none transition placeholder:text-zinc-400 focus:border-[#8b5cf6]/70 focus:ring-4 focus:ring-[#8b5cf6]/10 ${errors.password ? "border-red-500" : ""}`}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-400">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="remember" {...register("remember")} className="border-white/20 data-[state=checked]:bg-[#8b5cf6] data-[state=checked]:border-[#8b5cf6]" />
                                <Label htmlFor="remember" className="text-sm font-medium leading-none text-zinc-300">
                                    Remember me
                                </Label>
                            </div>
                            <Button
                                variant="link"
                                type="button"
                                className="text-sm text-[#8b5cf6] hover:text-[#a78bfa]"
                                onClick={() => router.push("/forgot-password")}
                            >
                                Forgot password?
                            </Button>
                        </div>

                        {error && (
                            <p className="text-sm text-red-400 text-center">{error}</p>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-10 rounded-xl bg-gradient-to-br from-[#7657ff] to-[#c052f4] text-white font-medium hover:opacity-90 transition"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Logging in..." : "Login"}
                        </Button>
                    </form>

                    <p className="mt-4 text-center text-sm text-zinc-400">
                        Don't have an account?{" "}
                        <Link href="/register" className="font-medium text-[#8b5cf6] hover:underline">
                            Sign Up
                        </Link>
                    </p>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#0b0c12] px-2 text-zinc-500">Or continue with</span>
                        </div>
                    </div>

                    <Button
                        onClick={() => signIn("google")}
                        className="w-full h-10 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] text-white hover:bg-white/10 transition"
                        variant="outline"
                    >
                        <img
                            src="https://www.google.com/favicon.ico"
                            alt="Google"
                            className="w-4 h-4"
                        />
                        Continue with Google
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
