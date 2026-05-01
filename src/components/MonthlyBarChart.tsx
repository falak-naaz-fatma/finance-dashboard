"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MonthlyData = {
  month: string;
  income: number;
  expense: number;
};

type ApiTransaction = {
  type: "income" | "expense";
  amount: number;
  date: string;
};

type MonthlyBucket = {
  month: string;
  income: number;
  expense: number;
  date: number;
};

const rupee = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function MonthlyBarChart({ refresh }: { refresh: boolean }) {
  const { data: session } = useSession();
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userId = (session?.user as { id?: string })?.id;
        if (!userId) return;
        const res = await fetch(`/api/transactions?userId=${userId}`);
        const transactions = (await res.json()) as ApiTransaction[];
        const monthlyMap: Record<string, MonthlyBucket> = {};

        transactions.forEach((transaction) => {
          const date = new Date(transaction.date);
          const key = `${date.getFullYear()}-${date.getMonth()}`;
          const month = date.toLocaleString("en-IN", { month: "short" });

          if (!monthlyMap[key]) {
            monthlyMap[key] = { month, income: 0, expense: 0, date: date.getTime() };
          }

          if (transaction.type === "income") monthlyMap[key].income += transaction.amount;
          if (transaction.type === "expense") monthlyMap[key].expense += transaction.amount;
          monthlyMap[key].date = Math.min(monthlyMap[key].date, date.getTime());
        });

        const chartData = Object.values(monthlyMap)
          .sort((a, b) => a.date - b.date)
          .slice(-6)
          .map((item) => ({
            month: item.month,
            income: item.income,
            expense: item.expense,
          }));

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
    >
    <Card className="glow-shell min-h-[190px] rounded-2xl border border-white/10 bg-card/60 py-5 shadow-card backdrop-blur-xl">
      <CardHeader className="flex-row items-start justify-between px-8">
        <div>
          <CardTitle className="text-lg font-semibold">Monthly Overview</CardTitle>
          <p className="mt-1 text-sm font-normal text-muted-foreground">Income vs Expense comparison</p>
        </div>
        <button className="flex h-10 min-w-28 items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 text-base font-semibold text-foreground transition hover:bg-white/10">
          6M
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </CardHeader>
      <CardContent className="px-8">
        {loading ? (
          <div className="flex h-[340px] items-center justify-center text-muted-foreground">Loading chart...</div>
        ) : data.length === 0 ? (
          <div className="flex h-[340px] items-center justify-center text-muted-foreground">No data yet</div>
        ) : (
          <>
            <div className="h-[340px] min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={data} barGap={5} barCategoryGap="28%" margin={{ top: 24, right: 8, left: 8, bottom: 8 }}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#22C55E" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#22C55E" stopOpacity={0.18} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity={0.18} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 8" strokeOpacity={0.1} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 15 }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 14 }}
                    tickFormatter={(value) => {
                      if (Number(value) >= 100000) return `₹${Number(value) / 100000}L`;
                      if (Number(value) >= 1000) return `₹${Math.round(Number(value) / 1000)}K`;
                      return `₹${value}`;
                    }}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--accent) / 0.45)" }}
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                    formatter={(value) => rupee.format(Number(value ?? 0))}
                  />
                  <Bar dataKey="income" fill="url(#incomeGradient)" radius={[10, 10, 4, 4]} name="Income" />
                  <Bar dataKey="expense" fill="url(#expenseGradient)" radius={[10, 10, 4, 4]} name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex gap-8">
              <span className="flex items-center gap-2 text-base font-medium">
                <span className="size-3.5 rounded-full bg-income" /> Income
              </span>
              <span className="flex items-center gap-2 text-base font-medium">
                <span className="size-3.5 rounded-full bg-expense" /> Expense
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
    </motion.div>
  );
}
