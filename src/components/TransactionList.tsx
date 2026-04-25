"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  Briefcase,
  Clapperboard,
  GraduationCap,
  HeartPulse,
  Plane,
  ReceiptText,
  ShoppingBag,
  Trash2,
  Utensils,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Transaction = {
  _id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description?: string;
  date: string;
};

type Props = {
  refresh: boolean;
  selectedMonth: string;
};

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
  business: Wallet,
  investment: Wallet,
  other: Wallet,
};

export default function TransactionList({ refresh, selectedMonth }: Props) {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const userId = "test123";
        const url = `/api/transactions?userId=${userId}${
          selectedMonth ? `&month=${selectedMonth}` : ""
        }`;
        const res = await fetch(url);
        const data = await res.json();
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchTransactions();
  }, [session, refresh, selectedMonth]);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Delete this transaction?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTransactions((prev) => prev.filter((t) => t._id !== id));
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  return (
    <Card className="rounded-[8px] border border-white/10 bg-[#15161f]/90 py-7 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
      <CardHeader className="flex flex-row items-start justify-between gap-4 px-8">
        <div className="min-w-0">
          <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
          <p className="mt-1 text-sm font-normal text-zinc-400">Your latest activity</p>
        </div>
        <button className="shrink-0 pt-1 text-sm font-medium text-[#8b5cf6] transition hover:text-[#a78bfa]">
          View All
        </button>
      </CardHeader>

      <CardContent className="px-8">
        {loading ? (
          <p className="py-14 text-center text-zinc-400">Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="py-14 text-center text-zinc-400">No transactions found</p>
        ) : (
          <div className="flex flex-col gap-5">
            {transactions.slice(0, 5).map((transaction) => {
              const Icon = categoryIcons[transaction.category] || Wallet;
              const isIncome = transaction.type === "income";

              return (
                <div
                  key={transaction._id}
                  className="group flex items-center justify-between gap-4 rounded-[8px] px-3 py-2 transition hover:bg-white/[0.03]"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className={`flex size-12 shrink-0 items-center justify-center rounded-full border ${
                        isIncome
                          ? "border-[#22d3a6]/20 bg-[#22d3a6]/12 text-[#22d3a6]"
                          : "border-[#ff416d]/20 bg-[#ff416d]/12 text-[#ff6b8a]"
                      }`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold capitalize">{transaction.category}</p>
                      <p className="truncate text-sm font-normal text-zinc-400">{transaction.description || "No description"}</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-4 text-right">
                    <div>
                      <p className={`text-lg font-semibold ${isIncome ? "text-[#22d3a6]" : "text-[#ff416d]"}`}>
                        {isIncome ? "+" : "-"}₹{transaction.amount.toLocaleString("en-IN")}
                      </p>
                      <p className="text-sm text-zinc-400">
                        {new Date(transaction.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(transaction._id)}
                      className="rounded-lg p-2 text-zinc-500 opacity-0 transition hover:bg-[#ff416d]/10 hover:text-[#ff416d] group-hover:opacity-100"
                      title="Delete transaction"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
