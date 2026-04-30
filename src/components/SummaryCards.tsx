"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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
      color: "text-[#25b6ff]",
      glow: "shadow-[0_0_45px_rgba(37,182,255,0.12)]",
      trend: "up",
      spark: "M1 18 C20 18 27 16 40 25 C54 35 62 38 78 28 C94 18 112 20 134 21",
    },
    {
      title: "Total Income",
      value: rupee.format(summary.totalIncome),
      change: "+8%",
      color: "text-[#22d3a6]",
      glow: "shadow-[0_0_45px_rgba(34,211,166,0.12)]",
      trend: "up",
      spark: "M1 16 C24 20 41 25 58 28 C74 31 83 22 105 23 C116 24 126 24 134 23",
    },
    {
      title: "Total Expense",
      value: rupee.format(summary.totalExpense),
      change: "-3%",
      color: "text-[#ff3f6c]",
      glow: "shadow-[0_0_45px_rgba(255,63,108,0.12)]",
      trend: "down",
      spark: "M1 14 C24 20 42 14 60 18 C78 22 96 27 115 25 C123 24 130 22 134 21",
    },
    {
      title: "Savings Rate",
      value: `${savingsRate}%`,
      change: "+5%",
      color: "text-[#8b5cf6]",
      glow: "shadow-[0_0_45px_rgba(139,92,246,0.12)]",
      trend: "up",
      ring: savingsRate,
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const isDown = card.trend === "down";
        return (
          <Card
            key={card.title}
            className={`min-h-[190px] rounded-[8px] border border-white/10 bg-card py-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]`}
          >
            <CardContent className="flex h-full flex-col px-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-normal text-muted-foreground">{card.title}</p>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold ${isDown
                    ? "border-danger/30 bg-danger/15 text-danger"
                    : "border-success/25 bg-success/15 text-success"
                    }`}
                >
                  {isDown ? <ArrowDownRight className="size-4" /> : <ArrowUpRight className="size-4" />}
                  {card.change}
                </span>
              </div>

              {loading ? (
                <div className="mt-7 h-10 w-40 animate-pulse rounded bg-muted" />
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
                    <div className="m-2 size-16 rounded-full bg-card" />
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
        );
      })}
    </section>
  );
}
