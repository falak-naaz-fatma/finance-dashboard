"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  PiggyBank,
  Search,
  Sun,
  Target,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import UserMenu from "@/components/UserMenu";
import { ResponsiveContainer as ChartContainer, Tooltip as ChartTooltip } from "recharts";
import {
  CartesianGrid as ReCartesianGrid,
  Line as ReLine,
  LineChart as ReLineChart,
  XAxis as ReXAxis,
  YAxis as ReYAxis,
  Bar as ReBar,
  BarChart as ReBarChart,
  Cell,
} from "recharts";

type Transaction = {
  _id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description?: string;
  date: string;
};

type BalancePoint = {
  month: string;
  balance: number;
};

type CategoryPoint = {
  category: string;
  amount: number;
};

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ClipboardList },
  { label: "Analytics", href: "/analytics", icon: BarChart3, active: true },
  { label: "Budget", href: "/budget", icon: Target },
  { label: "Savings Goals", href: "/savings-goals", icon: PiggyBank },
];

const categoryIcon: Record<string, string> = {
  education: "📚",
  shopping: "🛍️",
  food: "🍔",
  travel: "✈️",
  entertainment: "🎬",
  bills: "🧾",
  health: "💊",
  business: "🏢",
  other: "💳",
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

function formatCurrency(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function categoryLabel(category: string) {
  return category
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function lastSixMonths() {
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    return {
      key: monthKey(date),
      label: date.toLocaleString("en-IN", { month: "short" }),
    };
  });
}

function dayStart(value: string) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const userName = session?.user?.name || "Aarav Sharma";
  const userEmail = session?.user?.email || "aarav@fintrack.io";
  const initials = getInitials(userName, userEmail) || "AS";

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const userId = "test123";
        const res = await fetch(`/api/transactions?userId=${userId}`);
        const data = (await res.json()) as Transaction[];
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchTransactions();
  }, [session]);

  const analytics = useMemo(() => {
    const expenses = transactions.filter((transaction) => transaction.type === "expense");
    const income = transactions.filter((transaction) => transaction.type === "income");
    const byDay = new Map<number, number>();
    const byCategory = new Map<string, number>();
    const months = lastSixMonths();
    const monthly = new Map<string, { income: number; expense: number }>();

    months.forEach((month) => monthly.set(month.key, { income: 0, expense: 0 }));

    expenses.forEach((transaction) => {
      const date = new Date(transaction.date);
      byDay.set(dayStart(transaction.date), (byDay.get(dayStart(transaction.date)) || 0) + transaction.amount);
      byCategory.set(transaction.category, (byCategory.get(transaction.category) || 0) + transaction.amount);

      const bucket = monthly.get(monthKey(date));
      if (bucket) bucket.expense += transaction.amount;
    });

    income.forEach((transaction) => {
      const date = new Date(transaction.date);
      const bucket = monthly.get(monthKey(date));
      if (bucket) bucket.income += transaction.amount;
    });

    const highestDayEntry = [...byDay.entries()].sort((a, b) => b[1] - a[1])[0];
    const topCategory = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0];
    const totalExpense = expenses.reduce((sum, transaction) => sum + transaction.amount, 0);
    const uniqueDays = new Set(expenses.map((transaction) => dayStart(transaction.date))).size || 1;

    const balanceTrend = months.reduce<{ points: BalancePoint[]; cumulative: number }>(
      (state, month) => {
        const item = monthly.get(month.key) || { income: 0, expense: 0 };
        const cumulative = state.cumulative + item.income - item.expense;

        return {
          cumulative,
          points: [...state.points, { month: month.label, balance: Math.max(0, cumulative) }],
        };
      },
      { points: [], cumulative: 0 }
    ).points;

    const topCategories: CategoryPoint[] = [...byCategory.entries()]
      .map(([category, amount]) => ({ category: categoryLabel(category), amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      highestExpenseDay: highestDayEntry
        ? {
            amount: highestDayEntry[1],
            date: new Date(highestDayEntry[0]).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
            }),
          }
        : { amount: 0, date: "No data" },
      averageDailySpend: totalExpense / uniqueDays,
      mostSpentCategory: topCategory ? categoryLabel(topCategory[0]) : "No data",
      mostSpentCategoryKey: topCategory?.[0] || "other",
      balanceTrend,
      topCategories,
      activity: Array.from({ length: 84 }, (_, index) => {
        const transaction = expenses[index % Math.max(expenses.length, 1)];
        return transaction ? Math.min(5, Math.ceil((transaction.amount % 9000) / 1800)) : 0;
      }),
    };
  }, [transactions]);

  const maxCategory = Math.max(...analytics.topCategories.map((item) => item.amount), 1);

  return (
    <div className="min-h-screen bg-[#07080d] text-white">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] border-r border-white/10 bg-[#0b0c12] lg:flex lg:flex-col">
        <div className="flex items-center gap-3 px-7 py-8">
          <div className="flex size-11 items-center justify-center rounded-[13px] bg-gradient-to-br from-[#7657ff] to-[#c052f4] shadow-[0_0_30px_rgba(139,92,246,0.35)]">
            <WalletCards className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">FinTrack</p>
            <p className="text-sm text-zinc-400">Personal Finance</p>
          </div>
        </div>

        <nav className="mt-7 flex flex-1 flex-col gap-2 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex h-11 items-center gap-3 rounded-[14px] px-4 text-left text-sm font-medium transition ${
                  item.active
                    ? "bg-[#211a3d] text-[#8b5cf6] shadow-[inset_4px_0_0_#8b5cf6]"
                    : "text-zinc-200 hover:bg-white/5"
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
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07080d]/90 backdrop-blur">
          <div className="flex h-[72px] items-center gap-4 px-4 sm:px-8 lg:px-10">
            <div className="relative w-full max-w-[560px]">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                placeholder="Search transactions, categories..."
                className="h-9 w-full rounded-[12px] border border-white/10 bg-white/[0.06] px-10 text-sm font-normal text-white outline-none transition placeholder:text-zinc-400 focus:border-[#8b5cf6]/70 focus:ring-4 focus:ring-[#8b5cf6]/10"
              />
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button className="relative rounded-full p-2 text-zinc-200 transition hover:bg-white/10" title="Notifications">
                <Bell className="size-5" />
                <span className="absolute right-1.5 top-1.5 size-2.5 rounded-full bg-[#ff3f6c]" />
              </button>
              <button className="rounded-full p-2 text-zinc-200 transition hover:bg-white/10" title="Theme">
                <Sun className="size-5" />
              </button>
              <UserMenu userName={userName} userEmail={userEmail} initials={initials} onLogout={() => signOut()} />
            </div>
          </div>
        </header>

        <main className="px-4 py-10 sm:px-8 lg:px-10">
          <section className="mb-8">
            <h1 className="text-[30px] font-semibold leading-tight tracking-normal">Analytics</h1>
            <p className="mt-2 text-sm font-normal text-zinc-400">
              {loading ? "Loading spending patterns..." : "Deep dive into your spending patterns"}
            </p>
          </section>

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <article className="rounded-[8px] border border-white/10 bg-[#15161f]/90 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Highest Expense Day</p>
                  <p className="mt-4 text-[30px] font-semibold leading-none text-[#ff416d]">
                    {formatCurrency(analytics.highestExpenseDay.amount)}
                  </p>
                  <p className="mt-3 text-sm text-zinc-400">{analytics.highestExpenseDay.date}</p>
                </div>
                <span className="flex size-12 items-center justify-center rounded-[14px] bg-[#211a3d] text-[#ff416d]">
                  <CalendarDays className="size-5" />
                </span>
              </div>
            </article>

            <article className="rounded-[8px] border border-white/10 bg-[#15161f]/90 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Average Daily Spend</p>
                  <p className="mt-4 text-[30px] font-semibold leading-none text-[#25b6ff]">
                    {formatCurrency(analytics.averageDailySpend)}
                  </p>
                  <p className="mt-3 text-sm text-zinc-400">This month</p>
                </div>
                <span className="flex size-12 items-center justify-center rounded-[14px] bg-[#211a3d] text-[#25b6ff]">
                  <TrendingUp className="size-5" />
                </span>
              </div>
            </article>

            <article className="rounded-[8px] border border-white/10 bg-[#15161f]/90 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Most Spent Category</p>
                  <p className="mt-4 text-[30px] font-semibold leading-none text-[#8b5cf6]">
                    <span className="mr-2 text-2xl">{categoryIcon[analytics.mostSpentCategoryKey] || "💳"}</span>
                    {analytics.mostSpentCategory}
                  </p>
                  <p className="mt-3 text-sm text-zinc-400">This month</p>
                </div>
                <span className="flex size-12 items-center justify-center rounded-[14px] bg-[#211a3d] text-[#8b5cf6]">
                  <WalletCards className="size-5" />
                </span>
              </div>
            </article>
          </section>

          <section className="mt-7 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <article className="rounded-[8px] border border-white/10 bg-[#15161f]/90 p-7">
              <h2 className="text-lg font-semibold">Balance Trend</h2>
              <p className="mt-2 text-sm text-zinc-400">Cumulative balance over 6 months</p>
              <div className="mt-6 h-[300px] min-w-0">
                <ChartContainer width="100%" height="100%" minWidth={0}>
                  <ReLineChart data={analytics.balanceTrend} margin={{ top: 10, right: 12, bottom: 4, left: 10 }}>
                    <ReCartesianGrid vertical={false} stroke="#ffffff" strokeDasharray="4 5" strokeOpacity={0.1} />
                    <ReXAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                    <ReYAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#a1a1aa", fontSize: 12 }}
                      tickFormatter={(value) => {
                        if (Number(value) >= 100000) return `₹${Number(value) / 100000}L`;
                        if (Number(value) >= 1000) return `₹${Math.round(Number(value) / 1000)}K`;
                        return `₹${value}`;
                      }}
                    />
                    <ChartTooltip
                      contentStyle={{
                        background: "#0b0c12",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                      formatter={(value) => [`balance : ${formatCurrency(Number(value ?? 0))}`, ""]}
                    />
                    <ReLine
                      type="monotone"
                      dataKey="balance"
                      stroke="#7657ff"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#7657ff", stroke: "#25b6ff", strokeWidth: 2 }}
                      activeDot={{ r: 8, fill: "#7657ff", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </ReLineChart>
                </ChartContainer>
              </div>
            </article>

            <article className="rounded-[8px] border border-white/10 bg-[#15161f]/90 p-7">
              <h2 className="text-lg font-semibold">Top 5 Categories</h2>
              <p className="mt-2 text-sm text-zinc-400">Highest spending this month</p>
              <div className="mt-6 h-[300px] min-w-0">
                <ChartContainer width="100%" height="100%" minWidth={0}>
                  <ReBarChart
                    data={analytics.topCategories}
                    layout="vertical"
                    margin={{ top: 8, right: 12, bottom: 8, left: 40 }}
                  >
                    <ReCartesianGrid horizontal={false} stroke="#ffffff" strokeDasharray="4 5" strokeOpacity={0.08} />
                    <ReXAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#a1a1aa", fontSize: 12 }}
                      tickFormatter={(value) => {
                        if (Number(value) >= 1000) return `₹${Math.round(Number(value) / 1000)}K`;
                        return `₹${value}`;
                      }}
                      domain={[0, Math.ceil(maxCategory / 1000) * 1000]}
                    />
                    <ReYAxis
                      type="category"
                      dataKey="category"
                      axisLine={false}
                      tickLine={false}
                      width={110}
                      tick={({ x, y, payload }) => {
                        const key = String(payload.value).toLowerCase();
                        return (
                          <text x={x} y={y} dy={4} textAnchor="end" fill="#fff" fontSize={12}>
                            {categoryIcon[key] || "💳"} {payload.value}
                          </text>
                        );
                      }}
                    />
                    <ChartTooltip
                      contentStyle={{
                        background: "#0b0c12",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                      formatter={(value) => formatCurrency(Number(value ?? 0))}
                    />
                    <ReBar dataKey="amount" radius={[7, 7, 7, 7]} barSize={44}>
                      {analytics.topCategories.map((item) => (
                        <Cell key={item.category} fill="#9b63f4" />
                      ))}
                    </ReBar>
                  </ReBarChart>
                </ChartContainer>
              </div>
            </article>
          </section>

          <section className="mt-7 rounded-[8px] border border-white/10 bg-[#15161f]/90 p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Spending Activity</h2>
                <p className="mt-2 text-sm text-zinc-400">Last 12 weeks</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <span>Less</span>
                {[0, 1, 2, 3, 4, 5].map((level) => (
                  <span
                    key={level}
                    className="size-3 rounded-full"
                    style={{ backgroundColor: level === 0 ? "#20212a" : `rgba(139, 92, 246, ${0.18 + level * 0.14})` }}
                  />
                ))}
                <span>More</span>
              </div>
            </div>
            <div className="mt-6 grid w-fit grid-flow-col grid-rows-7 gap-2">
              {analytics.activity.map((level, index) => (
                <span
                  key={index}
                  className="size-5 rounded-full border border-white/[0.03]"
                  style={{ backgroundColor: level === 0 ? "#20212a" : `rgba(139, 92, 246, ${0.2 + level * 0.13})` }}
                />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
