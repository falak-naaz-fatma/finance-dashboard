"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import { Zap, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

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
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const userId = (session?.user as { id?: string })?.id;
        if (!userId) {
          setInsights([]);
          return;
        }
        const res = await fetch(`/api/insights?userId=${userId}`);
        const data = (await res.json()) as { insights?: string[] };
        setInsights(data.insights || []);
      } catch (error) {
        console.error("Error fetching insights:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchInsights();
  }, [session, refresh]);

  const localInsights = useMemo(() => {
    const data = transactions;
    if (!data) return [];

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
  }, [transactions]);

  const visibleInsights = insights.length > 0 ? insights : localInsights;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 170, damping: 22 }}
    >
      <GlassCard className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Zap className="size-5 text-primary" />
              <span className="gradient-text">AI Insights</span>
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">Signals from your spending patterns</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-xl border border-border bg-gradient-to-r from-purple-500/10 to-indigo-500/10 p-4">
                  <Skeleton height={18} baseColor="hsl(var(--muted))" highlightColor="hsl(var(--accent))" />
                  <Skeleton height={14} width="70%" baseColor="hsl(var(--muted))" highlightColor="hsl(var(--accent))" />
                </div>
              ))
            : visibleInsights.map((insight, index) => {
                const Icon = index === 1 && insight.includes("lower") ? TrendingDown : TrendingUp;
                return (
                  <motion.div
                    key={insight}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.15 }}
                    whileHover={{ y: -3 }}
                    className="rounded-xl border border-border bg-gradient-to-r from-purple-500/10 to-indigo-500/10 p-4 text-sm transition-all duration-300 ease-out hover:shadow-xl"
                  >
                    {index === 0 ? (
                      <Sparkles className="mb-3 size-5 text-primary" />
                    ) : (
                      <Icon className={`mb-3 size-5 ${index === 1 && insight.includes("higher") ? "text-expense" : "text-income"}`} />
                    )}
                    <p className="text-sm font-medium leading-6 text-foreground">{insight}</p>
                  </motion.div>
                );
              })}
        </div>
      </GlassCard>
    </motion.div>
  );
}
