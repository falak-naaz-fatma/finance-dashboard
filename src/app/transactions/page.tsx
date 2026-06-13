"use client";

import { signOut, useSession } from "next-auth/react";
import { BarChart3, LayoutDashboard, Search } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import TransactionTable from "@/components/TransactionTable";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: Search, active: true },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

function getInitials(name?: string | null, email?: string | null) {
  const source = name || email || "";
  return source
    .split(/[^\w]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function TransactionsPage() {
  const { data: session } = useSession();
  const refresh = false;
  const selectedMonth = "";

  // Show loading state while session is being fetched
  if (!session) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const userName = session.user?.name || "";
  const userEmail = session.user?.email || "";
  const initials = getInitials(userName, userEmail) || "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar navItems={navItems} />

      <div className="lg:pl-[280px]">
        <Header userName={userName} userEmail={userEmail} initials={initials} onLogout={() => signOut()} />

        <main className="px-4 pb-28 pt-10 sm:px-8 lg:px-10 lg:pb-10">
          <section className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[30px] font-semibold leading-tight tracking-normal">Transactions</h1>
              <p className="mt-2 text-sm font-normal text-muted-foreground">View and manage all your transactions</p>
            </div>

          </section>

          <TransactionTable refresh={refresh} selectedMonth={selectedMonth} />
        </main>
      </div>

    </div>
  );
}
