"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  BarChart3,
  Bell,
  ClipboardList,
  Home,
  LayoutDashboard,
  PiggyBank,
  Plane,
  Plus,
  Search,
  Shield,
  Smartphone,
  Sun,
  Target,
  WalletCards,
} from "lucide-react";
import UserMenu from "@/components/UserMenu";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ClipboardList },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Budget", href: "/budget", icon: Target },
  { label: "Savings Goals", href: "/savings-goals", icon: PiggyBank, active: true },
];

type Goal = {
  id: string;
  title: string;
  dueLabel: string;
  saved: number;
  target: number;
  icon: React.ComponentType<{ className?: string }>;
};

const goals: Goal[] = [
  {
    id: "emergency",
    title: "Emergency Fund",
    dueLabel: "Due Dec 2026",
    saved: 142000,
    target: 200000,
    icon: Shield,
  },
  {
    id: "vacation",
    title: "Vacation to Japan",
    dueLabel: "Due Sept 2026",
    saved: 48000,
    target: 150000,
    icon: Plane,
  },
  {
    id: "iphone",
    title: "New iPhone",
    dueLabel: "Due Jun 2026",
    saved: 95000,
    target: 120000,
    icon: Smartphone,
  },
  {
    id: "home",
    title: "Home Down Payment",
    dueLabel: "Due Jan 2028",
    saved: 320000,
    target: 1500000,
    icon: Home,
  },
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

function formatCurrency(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function percent(saved: number, target: number) {
  if (target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((saved / target) * 100)));
}

function ProgressRing({
  value,
  size = 52,
  stroke = 5,
}: {
  value: number;
  size?: number;
  stroke?: number;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#8b5cf6"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-xs font-semibold text-white">{clamped}%</span>
      </div>
    </div>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const Icon = goal.icon;
  const pct = percent(goal.saved, goal.target);
  const remaining = Math.max(0, goal.target - goal.saved);

  return (
    <article className="rounded-[8px] border border-white/10 bg-[#15161f]/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex size-12 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#7657ff] to-[#c052f4] shadow-[0_0_26px_rgba(139,92,246,0.18)]">
            <Icon className="size-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold leading-tight text-white">{goal.title}</h2>
            <p className="mt-1 text-sm text-zinc-400">{goal.dueLabel}</p>
          </div>
        </div>
        <ProgressRing value={pct} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-zinc-400">Saved</p>
          <p className="mt-2 text-xl font-semibold text-[#22d3a6]">{formatCurrency(goal.saved)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-zinc-400">Target</p>
          <p className="mt-2 text-xl font-semibold text-white">{formatCurrency(goal.target)}</p>
        </div>
      </div>

      <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#7657ff] to-[#c052f4]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-3 text-sm text-zinc-400">{formatCurrency(remaining)} to go</p>
    </article>
  );
}

export default function SavingsGoalsPage() {
  const { data: session } = useSession();

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

        <main className="px-4 py-10 sm:px-8 lg:px-10">
          <section className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[30px] font-semibold leading-tight tracking-normal">Savings Goals</h1>
              <p className="mt-2 text-sm font-normal text-zinc-400">Track progress toward what matters</p>
            </div>
            <button className="inline-flex h-10 items-center gap-2 rounded-[14px] bg-gradient-to-r from-[#7657ff] to-[#c052f4] px-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(139,92,246,0.25)] transition hover:brightness-110">
              <Plus className="size-4" />
              Add Goal
            </button>
          </section>

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}

