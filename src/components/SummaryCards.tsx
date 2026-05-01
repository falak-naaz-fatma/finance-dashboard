"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Summary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

type ApiTransaction = {
  type: "income" | "expense";
  amount: number;
};

type Props = {
  refresh: boolean;
  selectedMonth: string;
};

const rupee = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function SummaryCards({ refresh, selectedMonth }: Props) {
  const { data: session } = useSession();
  const [summary, setSummary] = useState<Summary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const userId = (session?.user as { id?: string })?.id;
        if (!userId) return;
        const url = `/api/transactions?userId=${userId}${selectedMonth ? `&month=${selectedMonth}` : ""
          }`;
        const res = await fetch(url);
        const transactions = (await res.json()) as ApiTransaction[];

        const totalIncome = transactions
          .filter((transaction) => transaction.type === "income")
          .reduce((sum, transaction) => sum + transaction.amount, 0);

        const totalExpense = transactions
          .filter((transaction) => transaction.type === "expense")
          .reduce((sum, transaction) => sum + transaction.amount, 0);

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

    if (session) fetchSummary();
  }, [session, refresh, selectedMonth]);

  const savingsRate =
    summary.totalIncome > 0
      ? Math.max(0, Math.round(((summary.totalIncome - summary.totalExpense) / summary.totalIncome) * 100))
      : 0;

  const cards = [
    {
      title: "Total Balance",
      value: rupee.format(summary.balance),
      change: "+12%",
      color: "text-info",
      trend: "up",
      spark: "M1 18 C20 18 27 16 40 25 C54 35 62 38 78 28 C94 18 112 20 134 21",
    },
    {
      title: "Total Income",
      value: rupee.format(summary.totalIncome),
      change: "+8%",
      color: "text-income",
      trend: "up",
      spark: "M1 16 C24 20 41 25 58 28 C74 31 83 22 105 23 C116 24 126 24 134 23",
    },
    {
      title: "Total Expense",
      value: rupee.format(summary.totalExpense),
      change: "-3%",
      color: "text-expense",
      trend: "down",
      spark: "M1 14 C24 20 42 14 60 18 C78 22 96 27 115 25 C123 24 130 22 134 21",
    },
    {
      title: "Savings Rate",
      value: `${savingsRate}%`,
      change: "+5%",
      color: "text-primary",
      trend: "up",
      ring: savingsRate,
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const isDown = card.trend === "down";
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <Card className="glow-shell min-h-[190px] rounded-2xl border border-white/10 bg-card/60 py-5 shadow-card backdrop-blur-xl">
              <CardContent className="flex h-full flex-col px-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-normal text-muted-foreground">{card.title}</p>
                <span
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold ${isDown
                    ? "border-expense/30 bg-expense/15 text-expense"
                    : "border-income/25 bg-income/15 text-income"
                    }`}
                >
                  {isDown ? <ArrowDownRight className="size-4" /> : <ArrowUpRight className="size-4" />}
                  {card.change}
                </span>
              </div>

              {loading ? (
                <div className="mt-7 h-10 w-40 animate-pulse rounded-xl bg-white/10" />
              ) : (
                <p className={`mt-4 text-[30px] font-semibold leading-none tracking-normal ${card.color}`}>{card.value}</p>
              )}

              {card.ring !== undefined ? (
                <div className="mt-auto flex justify-center pb-1">
                  <div
                    className="size-20 rounded-full"
                    style={{
                      background: `conic-gradient(hsl(var(--primary)) ${Math.min(card.ring, 100) * 3.6}deg, hsl(var(--card)) 0deg)`,
                    }}
                  >
                    <div className="m-2 size-16 rounded-full bg-background/80 backdrop-blur" />
                  </div>
                </div>
              ) : (
                <svg viewBox="0 0 136 46" className="mt-auto h-16 w-full overflow-visible">
                  <path
                    d={`${card.spark} L134 46 L1 46 Z`}
                    fill="currentColor"
                    className={card.color}
                    opacity="0.12"
                  />
                  <path d={card.spark} fill="none" stroke="currentColor" strokeWidth="2.5" className={card.color} />
                </svg>
              )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </section>
  );
}
