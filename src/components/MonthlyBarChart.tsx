"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MonthlyData = {
    month: string;
    income: number;
    expense: number;
};

export default function MonthlyBarChart({ refresh }: { refresh: boolean }) {
    const { data: session } = useSession();
    const [data, setData] = useState<MonthlyData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // const userId = (session?.user as any)?.id;
                const userId = "test123";
                const res = await fetch(`/api/transactions?userId=${userId}`);
                const transactions = await res.json();

                // Group by month
                const monthlyMap: Record<string, { income: number; expense: number }> = {};

                transactions.forEach((t: any) => {
                    const month = new Date(t.date).toLocaleString("en-IN", {
                        month: "short",
                        year: "numeric",
                    });

                    if (!monthlyMap[month]) {
                        monthlyMap[month] = { income: 0, expense: 0 };
                    }

                    if (t.type === "income") {
                        monthlyMap[month].income += t.amount;
                    } else {
                        monthlyMap[month].expense += t.amount;
                    }
                });

                // Convert to array and sort by date
                const chartData = Object.entries(monthlyMap)
                    .map(([month, values]) => ({ month, ...values }))
                    .slice(-6); // show last 6 months only

                setData(chartData);
            } catch (error) {
                console.error("Error fetching bar chart data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (session) fetchData();
    }, [session, refresh]);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-base">Monthly Income vs Expense</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <p className="text-gray-400">Loading chart...</p>
                    </div>
                ) : data.length === 0 ? (
                    <div className="h-64 flex items-center justify-center">
                        <p className="text-gray-400">No data yet</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={data} barCategoryGap="30%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="month"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                            />
                            <YAxis
                                tickFormatter={(v) => `₹${v.toLocaleString("en-IN")}`}
                                tick={{ fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                formatter={(value: any) =>
                                    value ? `₹${Number(value).toLocaleString("en-IN")}` : "₹0"
                                }
                            />
                            <Legend />
                            <Bar dataKey="income" fill="#34d399" radius={[4, 4, 0, 0]} name="Income" />
                            <Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} name="Expense" />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}