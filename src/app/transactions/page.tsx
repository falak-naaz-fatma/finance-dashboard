"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useState, useRef } from "react";
import { BarChart3, LayoutDashboard, PiggyBank, Plus, Search, Target, WalletCards } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import AddTransactionForm from "@/components/AddTransactionForm";
import TransactionList from "@/components/TransactionList";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: Search, active: true },
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

export default function TransactionsPage() {
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

        <main className="px-4 py-10 sm:px-8 lg:px-10">
          <section className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[30px] font-semibold leading-tight tracking-normal">Transactions</h1>
              <p className="mt-2 text-sm font-normal text-muted-foreground">View and manage all your transactions</p>
            </div>

          </section>

          <TransactionList refresh={refresh} selectedMonth={selectedMonth} />
        </main>
      </div>

    </div>
  );
}