"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#7c5cff", "#32b8f1", "#2ee0a5", "#ffbd4a", "#ff5b7a", "#94a3b8", "#f472b6"];

const categoryLabel: Record<string, string> = {
  food: "Food",
  travel: "Travel",
  shopping: "Shopping",
  bills: "Bills",
  health: "Health",
  education: "Education",
  other: "Other",
};

type ApiTransaction = {
  type: "income" | "expense";
  category: string;
  amount: number;
};

export default function ExpensePieChart({ refresh }: { refresh: boolean }) {
  const { data: session } = useSession();
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userId = "test123";
        const res = await fetch(`/api/transactions?userId=${userId}`);
        const transactions = (await res.json()) as ApiTransaction[];
        const grouped: Record<string, number> = {};

        transactions
          .filter((transaction) => transaction.type === "expense")
          .forEach((transaction) => {
            grouped[transaction.category] = (grouped[transaction.category] || 0) + transaction.amount;
          });

        setData(
          Object.entries(grouped)
            .map(([name, value]) => ({ name: categoryLabel[name] || name, value }))
            .sort((a, b) => b.value - a.value)
        );
      } catch (error) {
        console.error("Error fetching pie chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchData();
  }, [session, refresh]);

  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  return (
    <Card className={`min-h-[190px] rounded-[8px] border border-white/10 bg-card py-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]`}>
      <CardHeader className="px-8">
        <CardTitle className="text-lg font-semibold">Spending by Category</CardTitle>
        <p className="text-sm font-normal text-muted-foreground">This month</p>
      </CardHeader>
      <CardContent className="px-8">
        {loading ? (
          <div className="flex h-[340px] items-center justify-center text-muted-foreground">Loading chart...</div>
        ) : data.length === 0 ? (
          <div className="flex h-[340px] items-center justify-center text-muted-foreground">No expense data yet</div>
        ) : (
          <>
            <div className="relative h-[290px] min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={74}
                    outerRadius={120}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="hsl(var(--card))"
                    strokeWidth={3}
                  >
                    {data.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                    formatter={(value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total spent</p>
                  <p className="text-lg font-semibold text-danger">₹{total.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {data.slice(0, 6).map((item, index) => (
                <div key={item.name} className="flex items-center gap-3 text-sm">
                  <span className="size-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="font-medium">{item.name}</span>
                  <span className="ml-auto text-muted-foreground">
                    {total ? Math.round((item.value / total) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
