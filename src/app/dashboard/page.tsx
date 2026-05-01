"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  PiggyBank,
  Target,
} from "lucide-react";
import AddTransactionForm from "@/components/AddTransactionForm";
import TransactionList from "@/components/TransactionList";
import SummaryCards from "@/components/SummaryCards";
import ExpensePieChart from "@/components/ExpensePieChart";
import MonthlyBarChart from "@/components/MonthlyBarChart";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import SmartInsights from "@/components/SmartInsights";

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
      <Sidebar navItems={navItems} />

      <div className="lg:pl-[280px]">
        <Header userName={userName} userEmail={userEmail} initials={initials} onLogout={() => signOut()} />

        <main className="px-4 pb-28 pt-7 sm:px-8 lg:px-10 lg:pb-10">
          <section className="mb-7">
            <h1 className="text-[30px] font-semibold leading-tight tracking-normal">
              Welcome back, <span className="text-primary">{userName.split(" ")[0]}</span>
            </h1>
            <p className="mt-2 text-lg font-normal text-muted-foreground">Here&apos;s your financial snapshot for today</p>
          </section>

          <SummaryCards refresh={refresh} selectedMonth={selectedMonth} />

          <section className="mt-7">
            <SmartInsights refresh={refresh} />
          </section>

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
