"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Transaction = {
    _id: string;
    type: "income" | "expense";
    category: string;
    amount: number;
    description?: string;
    date: string;
};

type Props = {
    refresh: boolean;
    selectedMonth: string; // new prop
};

export default function TransactionList({ refresh, selectedMonth }: Props) {
    const { data: session } = useSession();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

    // Fetch transactions
    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const userId = (session?.user as any)?.id;
            // Add month to query if selected
            const url = `/api/transactions?userId=${userId}${selectedMonth ? `&month=${selectedMonth}` : ""
                }`;
            const res = await fetch(url);
            const data = await res.json();
            setTransactions(data);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) fetchTransactions();
    }, [session, refresh, selectedMonth]); // refetch when month changes

    // Delete transaction
    const handleDelete = async (id: string) => {
        const confirm = window.confirm("Are you sure you want to delete this?");
        if (!confirm) return;

        try {
            const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
            if (res.ok) {
                setTransactions((prev) => prev.filter((t) => t._id !== id));
            }
        } catch (error) {
            console.error("Error deleting transaction:", error);
        }
    };

    // Filter transactions
    const filtered = transactions.filter((t) =>
        filter === "all" ? true : t.type === filter
    );

    // Category emoji map
    const categoryEmoji: Record<string, string> = {
        food: "🍔",
        travel: "✈️",
        shopping: "🛍️",
        bills: "💡",
        health: "💊",
        education: "📚",
        salary: "💼",
        freelance: "💻",
        business: "🏢",
        investment: "📈",
        other: "💰",
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Transactions</CardTitle>

                    {/* Filter buttons */}
                    <div className="flex gap-2">
                        {["all", "income", "expense"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors ${filter === f
                                    ? f === "income"
                                        ? "bg-green-500 text-white"
                                        : f === "expense"
                                            ? "bg-red-500 text-white"
                                            : "bg-gray-800 text-white"
                                    : "bg-gray-100 text-gray-600"
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {loading ? (
                    <p className="text-center text-gray-400 py-8">Loading...</p>
                ) : filtered.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">No transactions found</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filtered.map((t) => (
                            <div
                                key={t._id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                {/* Left side — emoji + details */}
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">
                                        {categoryEmoji[t.category] || "💰"}
                                    </span>
                                    <div>
                                        <p className="font-medium capitalize">{t.category}</p>
                                        {t.description && (
                                            <p className="text-sm text-gray-500">{t.description}</p>
                                        )}
                                        <p className="text-xs text-gray-400">
                                            {new Date(t.date).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Right side — amount + delete */}
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`font-bold text-lg ${t.type === "income" ? "text-green-500" : "text-red-500"
                                            }`}
                                    >
                                        {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString("en-IN")}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(t._id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}