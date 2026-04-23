"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
    const { data: session } = useSession();
    const router = useRouter();

    // If already logged in, go to dashboard
    useEffect(() => {
        if (session) router.push("/dashboard");
    }, [session]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Finance Dashboard</CardTitle>
                    <CardDescription>Track your income and expenses easily</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <Button
                        onClick={() => signIn("google")}
                        className="w-full flex items-center gap-2"
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