"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  ClipboardList,
  Clapperboard,
  GraduationCap,
  HeartPulse,
  LayoutDashboard,
  PiggyBank,
  Plane,
  ReceiptText,
  Search,
  ShoppingBag,
  Sun,
  Target,
  Trash2,
  Utensils,
  Wallet,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import UserMenu from "@/components/UserMenu";

type Transaction = {
  _id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description?: string;
  date: string;
};

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ClipboardList, active: true },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Budget", href: "/budget", icon: Target },
  { label: "Savings Goals", href: "/savings-goals", icon: PiggyBank },
];

const categoryIcons: Record<string, LucideIcon> = {
  food: Utensils,
  travel: Plane,
  shopping: ShoppingBag,
  bills: ReceiptText,
  health: HeartPulse,
  education: GraduationCap,
  entertainment: Clapperboard,
  salary: Briefcase,
  freelance: BookOpen,
  business: Building2,
  investment: Wallet,
  other: Wallet,
};

const monthFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  year: "numeric",
});

function getInitials(name?: string | null, email?: string | null) {
  const source = name || email || "Aarav Sharma";
  return source
    .split(/[^\w]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function categoryLabel(category: string) {
  return category
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function dateLabel(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

function monthValue(date: Date) {
  return date.toISOString().slice(0, 7);
}

export default function TransactionsPage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [page, setPage] = useState(1);

  const userName = session?.user?.name || "Aarav Sharma";
  const userEmail = session?.user?.email || "aarav@fintrack.io";
  const initials = getInitials(userName, userEmail) || "AS";
  const pageSize = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const userId = "test123";
        const res = await fetch(`/api/transactions?userId=${userId}`);
        const data = (await res.json()) as Transaction[];
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchTransactions();
  }, [session]);

  const monthChips = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - index);
      return {
        value: monthValue(date),
        label: monthFormatter.format(date),
      };
    });

    return [{ value: "all", label: "All" }, ...months];
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const date = new Date(transaction.date);
      const matchesSearch =
        !normalized ||
        transaction.category.toLowerCase().includes(normalized) ||
        transaction.description?.toLowerCase().includes(normalized);
      const matchesType = typeFilter === "all" || transaction.type === typeFilter;
      const matchesMonth = monthFilter === "all" || monthValue(date) === monthFilter;

      return matchesSearch && matchesType && matchesMonth;
    });
  }, [transactions, query, typeFilter, monthFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleTransactions = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Delete this transaction?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTransactions((prev) => prev.filter((transaction) => transaction._id !== id));
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

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
            <h1 className="text-[30px] font-semibold leading-tight tracking-normal">Transactions</h1>
            <p className="mt-2 text-sm font-normal text-zinc-400">
              {filtered.length.toLocaleString("en-IN")} transactions found
            </p>
          </section>

          <section className="overflow-hidden rounded-[8px] border border-white/10 bg-[#15161f]/90 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
            <div className="border-b border-white/10 p-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start">
                <div className="min-w-0 flex-1">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      value={query}
                      onChange={(event) => {
                        setQuery(event.target.value);
                        setPage(1);
                      }}
                      placeholder="Search by category or description..."
                      className="h-9 w-full rounded-[11px] border border-white/10 bg-[#07080d] px-10 text-sm font-normal text-white outline-none placeholder:text-zinc-400 focus:border-[#8b5cf6]/70 focus:ring-4 focus:ring-[#8b5cf6]/10"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {monthChips.map((month) => (
                      <button
                        key={month.value}
                        onClick={() => {
                          setMonthFilter(month.value);
                          setPage(1);
                        }}
                        className={`h-7 rounded-full px-3 text-xs font-medium transition ${
                          monthFilter === month.value
                            ? "bg-[#3b2b69] text-white"
                            : "bg-white/[0.06] text-zinc-400 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {month.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid h-8 shrink-0 grid-cols-3 rounded-[10px] bg-white/[0.04] p-0.5">
                  {(["all", "income", "expense"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setTypeFilter(type);
                        setPage(1);
                      }}
                      className={`min-w-16 rounded-[8px] px-2.5 text-xs font-medium capitalize transition ${
                        typeFilter === type ? "bg-[#7657ff] text-white" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-left text-sm font-medium text-zinc-400">
                    <th className="w-[16%] px-8 py-3">Date</th>
                    <th className="w-[23%] px-6 py-3">Category</th>
                    <th className="w-[22%] px-6 py-3">Description</th>
                    <th className="w-[18%] px-6 py-3">Type</th>
                    <th className="w-[16%] px-6 py-3 text-right">Amount</th>
                    <th className="w-[5%] px-8 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-16 text-center text-sm text-zinc-400">
                        Loading transactions...
                      </td>
                    </tr>
                  ) : visibleTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-16 text-center text-sm text-zinc-400">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    visibleTransactions.map((transaction) => {
                      const Icon = categoryIcons[transaction.category] || Wallet;
                      const isIncome = transaction.type === "income";

                      return (
                        <tr
                          key={transaction._id}
                          className="group border-b border-white/[0.055] text-sm text-zinc-400 transition hover:bg-white/[0.025]"
                        >
                          <td className="px-8 py-4">{dateLabel(transaction.date)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3 text-white">
                              <Icon className="size-4 text-[#8b5cf6]" />
                              <span className="font-semibold">{categoryLabel(transaction.category)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-400">
                            {transaction.description || "No description"}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex h-5 items-center rounded-full border px-2.5 text-xs font-semibold uppercase ${
                                isIncome
                                  ? "border-[#22d3a6]/15 bg-[#22d3a6]/15 text-[#22d3a6]"
                                  : "border-[#ff416d]/20 bg-[#ff416d]/15 text-[#ff416d]"
                              }`}
                            >
                              {transaction.type}
                            </span>
                          </td>
                          <td
                            className={`px-6 py-4 text-right text-sm font-semibold ${
                              isIncome ? "text-[#22d3a6]" : "text-[#ff416d]"
                            }`}
                          >
                            {isIncome ? "+" : "-"}₹{transaction.amount.toLocaleString("en-IN")}
                          </td>
                          <td className="px-8 py-4 text-right">
                            <button
                              onClick={() => handleDelete(transaction._id)}
                              className="rounded-lg p-2 text-zinc-500 opacity-0 transition hover:bg-[#ff416d]/10 hover:text-[#ff416d] group-hover:opacity-100"
                              title="Delete transaction"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-8 py-5">
              <p className="text-sm text-zinc-400">Page {page} of {pageCount}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="h-9 rounded-[12px] border border-white/10 bg-[#07080d] px-4 text-sm font-semibold text-zinc-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                  disabled={page === pageCount}
                  className="h-9 rounded-[12px] border border-white/10 bg-[#07080d] px-4 text-sm font-semibold text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
