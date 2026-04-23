"use client";

import { useSession, signOut } from "next-auth/react";
import AddTransactionForm from "@/components/AddTransactionForm";

export default function DashboardPage() {
    const { data: session } = useSession();

    return (
        <div className="min-h-screen bg-gray-50 p-8">

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Finance Dashboard</h1>
                    <p className="text-gray-500">Welcome, {session?.user?.name} 👋</p>
                </div>
                <button
                    onClick={() => signOut()}
                    className="px-4 py-2 bg-red-500 text-white rounded-md text-sm"
                >
                    Logout
                </button>
            </div>

            {/* Add Transaction Form */}
            <div className="flex justify-center">
                <AddTransactionForm onSuccess={() => console.log("Transaction added!")} />
            </div>

        </div>
    );
}
