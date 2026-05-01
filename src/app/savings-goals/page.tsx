"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState, type ComponentType, type FormEvent } from "react";
import {
  BarChart3,
  ClipboardList,
  Home,
  LayoutDashboard,
  PiggyBank,
  Plane,
  Plus,
  Search,
  Shield,
  Smartphone,
  Target,
  WalletCards,
  X,
} from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";

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
  icon?: ComponentType<{ className?: string }>;
  emoji?: string;
};

const goals: Goal[] = [];

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
          stroke="hsl(var(--border))"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="hsl(var(--primary))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-xs font-semibold text-foreground">{clamped}%</span>
      </div>
    </div>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const Icon = goal.icon;
  const pct = percent(goal.saved, goal.target);
  const remaining = Math.max(0, goal.target - goal.saved);

  return (
    <Card className="rounded-[8px] border border-white/10 bg-card p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex size-12 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#7657ff] to-[#c052f4] shadow-[0_0_26px_rgba(139,92,246,0.18)]">
            {Icon ? <Icon className="size-5 text-white" /> : <span className="text-xl leading-none">{goal.emoji}</span>}
          </div>
          <div>
            <h2 className="text-lg font-semibold leading-tight text-foreground">{goal.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{goal.dueLabel}</p>
          </div>
        </div>
        <ProgressRing value={pct} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Saved</p>
          <p className="mt-2 text-xl font-semibold text-success">{formatCurrency(goal.saved)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Target</p>
          <p className="mt-2 text-xl font-semibold text-foreground">{formatCurrency(goal.target)}</p>
        </div>
      </div>

      <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-[#c052f4]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{formatCurrency(remaining)} to go</p>
    </Card>
  );
}

export default function SavingsGoalsPage() {
  const { data: session } = useSession();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [goalList, setGoalList] = useState(goals);
  const [emoji, setEmoji] = useState("\uD83C\uDFAF");
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");

  const userName = session?.user?.name || "Aarav Sharma";
  const userEmail = session?.user?.email || "aarav@fintrack.io";
  const initials = getInitials(userName, userEmail) || "AS";

  function resetCreateForm() {
    setEmoji("\uD83C\uDFAF");
    setGoalName("");
    setTargetAmount("");
  }

  function closeCreateGoal() {
    setIsCreateOpen(false);
    resetCreateForm();
  }

  function handleCreateGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedTarget = Number(targetAmount);

    if (!goalName.trim() || !Number.isFinite(parsedTarget) || parsedTarget <= 0) {
      return;
    }

    setGoalList((currentGoals) => [
      {
        id: `${Date.now()}-${goalName.trim().toLowerCase().replace(/\s+/g, "-")}`,
        title: goalName.trim(),
        dueLabel: "No due date",
        saved: 0,
        target: parsedTarget,
        emoji: emoji.trim() || "\uD83C\uDFAF",
      },
      ...currentGoals,
    ]);

    closeCreateGoal();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar navItems={navItems} />

      <div className="lg:pl-[280px]">
        <Header userName={userName} userEmail={userEmail} initials={initials} onLogout={() => signOut()} />

        <main className="px-4 py-10 sm:px-8 lg:px-10">
          <section className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[30px] font-semibold leading-tight tracking-normal">Savings Goals</h1>
              <p className="mt-2 text-sm font-normal text-muted-foreground">Track progress toward what matters</p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-[14px] bg-gradient-to-r from-primary to-[#c052f4] px-4 text-sm font-semibold text-primary-foreground shadow-[0_18px_40px_rgba(139,92,246,0.25)] transition hover:brightness-110"
            >
              <Plus className="size-4" />
              Add Goal
            </button>
          </section>

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {goalList.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </section>
        </main>
      </div>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/[0.78] px-4 py-6 backdrop-blur-[1px]">
          <form
            onSubmit={handleCreateGoal}
            className="flex w-full max-w-[640px] flex-col overflow-hidden rounded-[16px] border border-border bg-popover shadow-[0_28px_90px_rgba(0,0,0,0.65)]"
          >
            <div className="flex items-center justify-between gap-4 px-7 pt-7">
              <h2 className="text-xl font-semibold leading-tight text-foreground">Create a savings goal</h2>
              <button
                type="button"
                onClick={closeCreateGoal}
                className="rounded-full p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                title="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-5 px-7 py-7">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-foreground">Emoji</span>
                <input
                  value={emoji}
                  onChange={(event) => setEmoji(event.target.value)}
                  aria-label="Goal emoji"
                  className="h-[58px] w-full rounded-[16px] border border-primary bg-background px-4 text-lg text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/80 focus:ring-4 focus:ring-primary/45"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-foreground">Goal Name</span>
                <input
                  value={goalName}
                  onChange={(event) => setGoalName(event.target.value)}
                  placeholder="e.g. New Laptop"
                  className="h-[50px] w-full rounded-[14px] border border-border bg-background px-4 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/80 focus:ring-4 focus:ring-primary/15"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-foreground">Target Amount</span>
                <input
                  value={targetAmount}
                  onChange={(event) => setTargetAmount(event.target.value)}
                  inputMode="numeric"
                  placeholder="100000"
                  className="h-[50px] w-full rounded-[14px] border border-border bg-background px-4 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/80 focus:ring-4 focus:ring-primary/15"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-border bg-popover px-7 py-7">
              <button
                type="button"
                onClick={closeCreateGoal}
                className="h-12 rounded-[12px] border border-border px-5 text-sm font-semibold text-foreground transition hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-12 rounded-[12px] bg-gradient-to-r from-primary to-[#c052f4] px-6 text-sm font-semibold text-primary-foreground shadow-[0_16px_34px_rgba(139,92,246,0.28)] transition hover:brightness-110"
              >
                Create Goal
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}