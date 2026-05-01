"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import { Lightbulb, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Transaction = {
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
};

type Props = {
  transactions?: Transaction[];
  refresh?: boolean;
};

function monthStart(offset = 0) {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  date.setMonth(date.getMonth() + offset);
  return date;
}

function isInRange(value: string, start: Date, end: Date) {
  const date = new Date(value);
  return date >= start && date < end;
}

function label(category: string) {
  return category
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export default function SmartInsights({ transactions, refresh }: Props) {
  const { data: session } = useSession();
  const [remoteTransactions, setRemoteTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(!transactions);

  useEffect(() => {
    if (transactions) return;

    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const userId = (session?.user as { id?: string })?.id;
        if (!userId) return;
        const res = await fetch(`/api/transactions?userId=${userId}`);
        setRemoteTransactions((await res.json()) as Transaction[]);
      } catch (error) {
        console.error("Error fetching insights:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchTransactions();
  }, [session, transactions, refresh]);

  const insights = useMemo(() => {
    const data = transactions ?? remoteTransactions;
    const currentStart = monthStart(0);
    const nextStart = monthStart(1);
    const previousStart = monthStart(-1);

    const currentExpenses = data.filter(
      (transaction) => transaction.type === "expense" && isInRange(transaction.date, currentStart, nextStart)
    );
    const previousExpenses = data.filter(
      (transaction) => transaction.type === "expense" && isInRange(transaction.date, previousStart, currentStart)
    );
    const currentIncome = data
      .filter((transaction) => transaction.type === "income" && isInRange(transaction.date, currentStart, nextStart))
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const currentExpense = currentExpenses.reduce((sum, transaction) => sum + transaction.amount, 0);
    const previousExpense = previousExpenses.reduce((sum, transaction) => sum + transaction.amount, 0);
    const categoryTotals = currentExpenses.reduce<Record<string, number>>((totals, transaction) => {
      totals[transaction.category] = (totals[transaction.category] || 0) + transaction.amount;
      return totals;
    }, {});
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    const expenseDelta = previousExpense > 0 ? Math.round(((currentExpense - previousExpense) / previousExpense) * 100) : 0;
    const savingsRate = currentIncome > 0 ? Math.round(((currentIncome - currentExpense) / currentIncome) * 100) : 0;

    return [
      topCategory
        ? `You spent ${Math.max(1, Math.round((topCategory[1] / Math.max(currentExpense, 1)) * 100))}% of expenses on ${label(topCategory[0])}.`
        : "Add a few transactions to unlock category insights.",
      expenseDelta > 0
        ? `Spending is ${expenseDelta}% higher than last month.`
        : expenseDelta < 0
          ? `Spending is ${Math.abs(expenseDelta)}% lower than last month.`
          : "Spending is steady compared with last month.",
      savingsRate > 0
        ? `Your current savings rate is ${savingsRate}%.`
        : "Income coverage is tight this month. Watch discretionary expenses.",
    ];
  }, [remoteTransactions, transactions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 170, damping: 22 }}
    >
      <Card className="glow-shell rounded-2xl border border-white/10 bg-card/60 py-5 shadow-card backdrop-blur-xl">
        <CardHeader className="flex-row items-center justify-between px-6">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Lightbulb className="size-5 text-primary" />
              Smart Insights
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Signals from your spending patterns</p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 px-6 md:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Skeleton height={18} baseColor="hsl(var(--muted))" highlightColor="hsl(var(--accent))" />
                  <Skeleton height={14} width="70%" baseColor="hsl(var(--muted))" highlightColor="hsl(var(--accent))" />
                </div>
              ))
            : insights.map((insight, index) => {
                const Icon = index === 1 && insight.includes("lower") ? TrendingDown : TrendingUp;
                return (
                  <motion.div
                    key={insight}
                    whileHover={{ y: -3 }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <Icon className={`mb-3 size-5 ${index === 1 && insight.includes("higher") ? "text-expense" : "text-income"}`} />
                    <p className="text-sm font-medium leading-6 text-foreground">{insight}</p>
                  </motion.div>
                );
              })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
