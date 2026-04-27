"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  PiggyBank,
  Search,
  Target,
  WalletCards,
} from "lucide-react";
import Header from "@/components/Header";

type Transaction = {
  _id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
};

type BudgetItem = {
  category: string;
  limit: number;
  color: string;
};

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ClipboardList },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Budget", href: "/budget", icon: Target, active: true },
  { label: "Savings Goals", href: "/savings-goals", icon: PiggyBank },
];

const budgets: BudgetItem[] = [
  { category: "food", limit: 15000, color: "from-[#ffb21f] to-[#ff7a1a]" },
  { category: "travel", limit: 12000, color: "from-[#20d39f] to-[#2dd4bf]" },
  { category: "shopping", limit: 10000, color: "from-[#ff416d] to-[#ec4ed8]" },
  { category: "bills", limit: 18000, color: "from-[#34d399] to-[#2dd4bf]" },
  { category: "health", limit: 5000, color: "from-[#ff416d] to-[#ec4ed8]" },
  { category: "education", limit: 6000, color: "from-[#ff416d] to-[#ec4ed8]" },
  { category: "entertainment", limit: 4000, color: "from-[#ff416d] to-[#ec4ed8]" },
];

const categoryIcon: Record<string, string> = {
  food: "🍔",
  travel: "✈️",
  shopping: "🛍️",
  bills: "🧾",
  health: "💊",
  education: "📚",
  entertainment: "🎬",
};

function getInitials(name?: string | null, email?: string | null) {
  const source = name || email || "Aarav Sharma";
  return source
    .split(/[^\w]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function label(category: string) {
  return category[0].toUpperCase() + category.slice(1);
}

function currency(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export default function BudgetPage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const userName = session?.user?.name || "Aarav Sharma";
  const userEmail = session?.user?.email || "aarav@fintrack.io";
  const initials = getInitials(userName, userEmail) || "AS";

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const userId = "test123";
        const res = await fetch(`/api/transactions?userId=${userId}`);
        const data = (await res.json()) as Transaction[];
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching budget data:", error);
      }
    };

    if (session) fetchTransactions();
  }, [session]);

  const budgetData = useMemo(() => {
    const spentByCategory = new Map<string, number>();

    transactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        spentByCategory.set(
          transaction.category,
          (spentByCategory.get(transaction.category) || 0) + transaction.amount
        );
      });

    const items = budgets.map((budget) => {
      const spent = spentByCategory.get(budget.category) || 0;
      const percent = Math.min(100, Math.round((spent / budget.limit) * 100));
      const remaining = budget.limit - spent;

      return { ...budget, spent, percent, remaining };
    });

    const totalLimit = budgets.reduce((sum, budget) => sum + budget.limit, 0);
    const totalSpent = items.reduce((sum, item) => sum + item.spent, 0);

    return {
      items,
      totalLimit,
      totalSpent,
      totalRemaining: totalLimit - totalSpent,
      totalPercent: Math.min(100, Math.round((totalSpent / totalLimit) * 100)),
    };
  }, [transactions]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] border-r border-border bg-sidebar lg:flex lg:flex-col">
        <div className="flex items-center gap-3 px-7 py-8">
          <div className="flex size-11 items-center justify-center rounded-[13px] bg-gradient-to-br from-[#7657ff] to-[#c052f4] shadow-[0_0_30px_rgba(139,92,246,0.35)]">
            <WalletCards className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">FinTrack</p>
            <p className="text-sm text-muted-foreground">Personal Finance</p>
          </div>
        </div>

        <nav className="mt-7 flex flex-1 flex-col gap-2 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex h-11 items-center gap-3 rounded-[14px] px-4 text-left text-sm font-medium transition ${item.active
                  ? "bg-primary/15 text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-[280px]">
        <Header userName={userName} userEmail={userEmail} initials={initials} onLogout={() => signOut()} />

        <main className="px-4 py-10 sm:px-8 lg:px-10">
          <section className="mb-8">
            <h1 className="text-[30px] font-semibold leading-tight tracking-normal">Budget</h1>
            <p className="mt-2 text-sm font-normal text-muted-foreground">Track your monthly spending against limits</p>
          </section>

          <section className="rounded-[8px] border border-border bg-card p-7 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Overall Budget</p>
                <p className="mt-3 text-[30px] font-semibold leading-none text-danger">
                  {currency(budgetData.totalSpent)}
                  <span className="ml-2 text-xl font-normal text-muted-foreground">/ {currency(budgetData.totalLimit)}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className={`mt-2 text-2xl font-semibold ${budgetData.totalRemaining >= 0 ? "text-success" : "text-danger"}`}>
                  {currency(Math.abs(budgetData.totalRemaining))}
                </p>
              </div>
            </div>
            <div className="mt-7 h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-danger to-[#ec4ed8]"
                style={{ width: `${budgetData.totalPercent}%` }}
              />
            </div>
          </section>

          <section className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            {budgetData.items.map((item) => {
              const overBudget = item.remaining < 0;

              return (
                <article
                  key={item.category}
                  className="rounded-[8px] border border-border bg-card p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 items-center justify-center rounded-[14px] bg-muted text-xl">
                        {categoryIcon[item.category] || "💳"}
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">{label(item.category)}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Limit {currency(item.limit)}</p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-sm font-semibold ${overBudget
                        ? "border-danger/25 bg-danger/15 text-danger"
                        : item.percent > 80
                          ? "border-warning/25 bg-warning/15 text-warning"
                          : "border-success/20 bg-success/15 text-success"
                        }`}
                    >
                      {item.percent}%
                    </span>
                  </div>

                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full bg-gradient-to-r ${item.color}`} style={{ width: `${item.percent}%` }} />
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <p className="text-muted-foreground">
                      Spent <span className="font-semibold text-foreground">{currency(item.spent)}</span>
                    </p>
                    <p className={`font-semibold ${overBudget ? "text-danger" : "text-success"}`}>
                      {overBudget ? `Over ${currency(Math.abs(item.remaining))}` : `${currency(item.remaining)} left`}
                    </p>
                  </div>
                </article>
              );
            })}
          </section>
        </main>
      </div>
    </div>
  );
}