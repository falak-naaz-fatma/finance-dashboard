"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
    BookOpen,
    Briefcase,
    Clapperboard,
    GraduationCap,
    HeartPulse,
    Plane,
    ReceiptText,
    ShoppingBag,
    Utensils,
    Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
    selectedMonth: string;
};

const categoryIcons: Record<string, LucideIcon> = {
    food: Utensils,
    travel: Plane,
    shopping: ShoppingBag,
    bills: ReceiptText,
    health: HeartPulse,
    education: GraduationCap,
    entertainment: Clapperboard,
    salary: Briefcase,
    freelance: BookOpen,
    business: Wallet,
    investment: Wallet,
    other: Wallet,
};

export default function TransactionTable({ refresh, selectedMonth }: Props) {
    const { data: session } = useSession();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
    const [selectedMonthState, setSelectedMonthState] = useState<string | null>(selectedMonth || null);
    const [availableMonths, setAvailableMonths] = useState<string[]>([]);

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const userId = (session?.user as { id?: string })?.id;
                if (!userId) return;
                const url = `/api/transactions?userId=${userId}`;
                const res = await fetch(url);
                const data = await res.json();
                setTransactions(data);

                // Extract unique months with year from all transactions (not just filtered ones)
                const allTransactionsRes = await fetch(`/api/transactions?userId=${userId}`);
                const allTransactions = await allTransactionsRes.json();
                const months = [...new Set<string>(allTransactions.map((t: Transaction) => {
                    const date = new Date(t.date);
                    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
                }))].sort((a, b) => {
                    const dateA = new Date(a);
                    const dateB = new Date(b);
                    return dateB.getTime() - dateA.getTime(); // Descending order
                });
                setAvailableMonths(months);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            } finally {
                setLoading(false);
            }
        };

        if (session) fetchTransactions();
    }, [session, refresh, selectedMonthState]);

    const handleMonthChange = (month: string) => {
        setSelectedMonthState(month);
    };

    const filteredTransactions = transactions.filter((transaction) => {
        const matchesSearch =
            !searchTerm ||
            transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === "all" || transaction.type === filterType;
        const matchesMonth = !selectedMonthState || new Date(transaction.date).toLocaleString('default', { month: 'short', year: 'numeric' }) === selectedMonthState;
        return matchesSearch && matchesType && matchesMonth;
    });

    return (
        <Card className="min-h-[400px] rounded-2xl border border-white/10 bg-card/60 py-5 shadow-card backdrop-blur-xl">
            <CardContent className="px-6">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search by category or description..."
                            className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/80 focus:ring-4 focus:ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            className={`h-8 rounded-full px-4 text-sm font-medium transition ${filterType === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
                            onClick={() => setFilterType("all")}
                        >
                            All
                        </button>
                        <button
                            className={`h-8 rounded-full px-4 text-sm font-medium transition ${filterType === "income" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
                            onClick={() => setFilterType("income")}
                        >
                            Income
                        </button>
                        <button
                            className={`h-8 rounded-full px-4 text-sm font-medium transition ${filterType === "expense" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
                            onClick={() => setFilterType("expense")}
                        >
                            Expense
                        </button>
                    </div>
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
                    <button
                        onClick={() => handleMonthChange("")}
                        className={`h-8 rounded-full px-4 text-sm font-medium transition ${!selectedMonthState ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
                    >
                        All
                    </button>
                    {availableMonths.map((month) => (
                        <button
                            key={month}
                            onClick={() => handleMonthChange(month)}
                            className={`h-8 rounded-full px-4 text-sm font-medium transition ${selectedMonthState === month ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
                        >
                            {month}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <p className="py-14 text-center text-muted-foreground">Loading...</p>
                ) : filteredTransactions.length === 0 ? (
                    <p className="py-14 text-center text-muted-foreground">No transactions found</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl">
                                <tr className="border-b border-white/10 text-left text-sm font-medium text-muted-foreground">
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Category</th>
                                    <th className="px-4 py-3">Description</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map((transaction) => {
                                    const Icon = categoryIcons[transaction.category] || Wallet;
                                    const isIncome = transaction.type === "income";

                                    return (
                                        <motion.tr
                                            key={transaction._id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="border-b border-white/10 transition hover:bg-white/5"
                                        >
                                            <td className="px-4 py-4">
                                                <p className="text-sm font-medium">
                                                    {new Date(transaction.date).toLocaleDateString("en-IN", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "2-digit",
                                                    })}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`flex size-8 items-center justify-center rounded-md ${isIncome ? "bg-income/10 text-income" : "bg-expense/10 text-expense"}`}>
                                                        <Icon className="size-4" />
                                                    </div>
                                                    <span className="text-sm font-medium capitalize">{transaction.category}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-sm font-normal">{transaction.description || "-"}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isIncome
                                                    ? "bg-income/15 text-income"
                                                    : "bg-expense/15 text-expense"
                                                    }`}>
                                                    {transaction.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <p className={`text-sm font-semibold ${isIncome ? "text-income" : "text-expense"}`}>
                                                    {isIncome ? "+" : ""}₹{transaction.amount.toLocaleString("en-IN")}
                                                </p>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
