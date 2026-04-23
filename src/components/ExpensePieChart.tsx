"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = [
    "#f87171", "#fb923c", "#fbbf24", "#34d399",
    "#60a5fa", "#a78bfa", "#f472b6", "#94a3b8"
];

const categoryEmoji: Record<string, string> = {
    food: "🍔", travel: "✈️", shopping: "🛍️",
    bills: "💡", health: "💊", education: "📚",
    salary: "💼", freelance: "💻", business: "🏢",
    investment: "📈", other: "💰",
};

export default function ExpensePieChart({ refresh }: { refresh: boolean }) {
    const { data: session } = useSession();
    const [data, setData] = useState<{ name: string; value: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const userId = (session?.user as any)?.id;
                const res = await fetch(`/api/transactions?userId=${userId}`);
                const transactions = await res.json();

                // Group expenses by category
                const expenses = transactions.filter((t: any) => t.type === "expense");
                const grouped: Record<string, number> = {};

                expenses.forEach((t: any) => {
                    grouped[t.category] = (grouped[t.category] || 0) + t.amount;
                });

                const chartData = Object.entries(grouped).map(([name, value]) => ({
                    name: `${categoryEmoji[name] || "💰"} ${name}`,
                    value,
                }));

                setData(chartData);
            } catch (error) {
                console.error("Error fetching pie chart data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (session) fetchData();
    }, [session, refresh]);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-base">Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <p className="text-gray-400">Loading chart...</p>
                    </div>
                ) : data.length === 0 ? (
                    <div className="h-64 flex items-center justify-center">
                        <p className="text-gray-400">No expense data yet</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={4}
                                dataKey="value"
                            >
                                {data.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: any) =>
                                    value ? `₹${Number(value).toLocaleString("en-IN")}` : "₹0"
                                }
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}