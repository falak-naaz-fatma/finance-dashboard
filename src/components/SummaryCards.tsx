"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Summary = {
    totalIncome: number;
    totalExpense: number;
    balance: number;
};

type Props = {
    refresh: boolean;
    selectedMonth: string; // new prop
};

export default function SummaryCards({ refresh, selectedMonth }: Props) {
    const { data: session } = useSession();
    const [summary, setSummary] = useState<Summary>({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            // const userId = (session?.user as any)?.id;
            const userId = "test123";
            const url = `/api/transactions?userId=${userId}${selectedMonth ? `&month=${selectedMonth}` : ""
                }`;
            const res = await fetch(url);
            const transactions = await res.json();

            // Calculate totals from transactions
            const totalIncome = transactions
                .filter((t: any) => t.type === "income")
                .reduce((sum: number, t: any) => sum + t.amount, 0);

            const totalExpense = transactions
                .filter((t: any) => t.type === "expense")
                .reduce((sum: number, t: any) => sum + t.amount, 0);

            setSummary({
                totalIncome,
                totalExpense,
                balance: totalIncome - totalExpense,
            });
        } catch (error) {
            console.error("Error fetching summary:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) fetchSummary();
    }, [session, refresh, selectedMonth]); // add selectedMonth here

    const cards = [
        {
            title: "Total Income",
            amount: summary.totalIncome,
            color: "text-green-500",
            bg: "bg-green-50",
            border: "border-green-100",
            icon: "💰",
        },
        {
            title: "Total Expense",
            amount: summary.totalExpense,
            color: "text-red-500",
            bg: "bg-red-50",
            border: "border-red-100",
            icon: "💸",
        },
        {
            title: "Balance",
            amount: summary.balance,
            color: summary.balance >= 0 ? "text-blue-500" : "text-red-500",
            bg: summary.balance >= 0 ? "bg-blue-50" : "bg-red-50",
            border: summary.balance >= 0 ? "border-blue-100" : "border-red-100",
            icon: summary.balance >= 0 ? "✅" : "⚠️",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {cards.map((card) => (
                <Card key={card.title} className={`border ${card.border} ${card.bg}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <span>{card.icon}</span>
                            {card.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
                        ) : (
                            <p className={`text-2xl font-bold ${card.color}`}>
                                ₹{card.amount.toLocaleString("en-IN")}
                            </p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}