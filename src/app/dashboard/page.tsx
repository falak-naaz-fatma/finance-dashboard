"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import {
  BarChart3,
  Bell,
  ClipboardList,
  LayoutDashboard,
  PiggyBank,
  Search,
  Sun,
  Target,
  WalletCards,
} from "lucide-react";
import AddTransactionForm from "@/components/AddTransactionForm";
import TransactionList from "@/components/TransactionList";
import SummaryCards from "@/components/SummaryCards";
import ExpensePieChart from "@/components/ExpensePieChart";
import MonthlyBarChart from "@/components/MonthlyBarChart";
import UserMenu from "@/components/UserMenu";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, active: true },
  { label: "Transactions", href: "/transactions", icon: ClipboardList },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Budget", href: "/budget", icon: Target },
  { label: "Savings Goals", href: "/savings-goals", icon: PiggyBank },
];

function getInitials(name?: string | null, email?: string | null) {
  const source = name || email || "Aarav Sharma";
  return source
    .split(/[^\w]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [refresh, setRefresh] = useState(false);
  const [selectedMonth] = useState("");

  const handleSuccess = () => setRefresh((prev) => !prev);
  const userName = session?.user?.name || "Aarav Sharma";
  const userEmail = session?.user?.email || "aarav@fintrack.io";
  const initials = getInitials(userName, userEmail) || "AS";

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

        <main className="px-4 py-7 sm:px-8 lg:px-10">
          <section className="mb-7">
            <h1 className="text-[30px] font-semibold leading-tight tracking-normal">
              Welcome back, <span className="text-[#8b5cf6]">{userName.split(" ")[0]}</span>
            </h1>
            <p className="mt-2 text-lg font-normal text-zinc-400">Here&apos;s your financial snapshot for today</p>
          </section>

          <SummaryCards refresh={refresh} selectedMonth={selectedMonth} />

          <section className="mt-7 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(340px,0.98fr)]">
            <MonthlyBarChart refresh={refresh} />
            <ExpensePieChart refresh={refresh} />
          </section>

          <section className="mt-7 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(340px,0.98fr)]">
            <TransactionList refresh={refresh} selectedMonth={selectedMonth} />
            <AddTransactionForm onSuccess={handleSuccess} />
          </section>
        </main>
      </div>
    </div>
  );
}
