"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  PiggyBank,
  Target,
  WalletCards,
} from "lucide-react";
import AddTransactionForm from "@/components/AddTransactionForm";
import TransactionList from "@/components/TransactionList";
import SummaryCards from "@/components/SummaryCards";
import ExpensePieChart from "@/components/ExpensePieChart";
import MonthlyBarChart from "@/components/MonthlyBarChart";
import Header from "@/components/Header";

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

        <main className="px-4 py-7 sm:px-8 lg:px-10">
          <section className="mb-7">
            <h1 className="text-[30px] font-semibold leading-tight tracking-normal">
              Welcome back, <span className="text-primary">{userName.split(" ")[0]}</span>
            </h1>
            <p className="mt-2 text-lg font-normal text-muted-foreground">Here's your financial snapshot for today</p>
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