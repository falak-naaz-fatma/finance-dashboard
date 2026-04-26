"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (session) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07080d] text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="size-8 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-zinc-400">Loading...</p>
      </div>
    </div>
  );
}
