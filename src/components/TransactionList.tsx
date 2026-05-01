"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  const router = useRouter();

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const userId = (session?.user as { id?: string })?.id;
        if (!userId) return;
        const url = `/api/transactions?userId=${userId}${selectedMonth ? `&month=${selectedMonth}` : ""
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

  const handleViewAll = () => {
    router.push("/transactions");
  };

  return (
    <Card className="glow-shell min-h-[190px] rounded-2xl border border-white/10 bg-card/60 py-5 shadow-card backdrop-blur-xl">
      <CardHeader className="flex flex-row items-start justify-between gap-4 px-8">
        <div className="min-w-0">
          <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
          <p className="mt-1 text-sm font-normal text-muted-foreground">Your latest activity</p>
        </div>
        <button
          className="shrink-0 pt-1 text-sm font-medium text-primary transition hover:text-primary/80"
          onClick={handleViewAll}
        >
          View All
        </button>
      </CardHeader>

      <CardContent className="px-8">
        {loading ? (
          <p className="py-14 text-center text-muted-foreground">Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="py-14 text-center text-muted-foreground">No transactions found</p>
        ) : (
          <div className="flex flex-col gap-3">
            {transactions.slice(0, 5).map((transaction) => {
              const Icon = categoryIcons[transaction.category] || Wallet;
              const isIncome = transaction.type === "income";

              return (
                <motion.div
                  key={transaction._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ x: 4 }}
                  className="group flex items-center justify-between gap-4 rounded-2xl px-3 py-3 transition hover:bg-white/5"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className={`flex size-12 shrink-0 items-center justify-center rounded-full border ${isIncome
                        ? "border-income/20 bg-income/10 text-income"
                        : "border-expense/20 bg-expense/10 text-expense"
                        }`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold capitalize">{transaction.category}</p>
                      <p className="truncate text-sm font-normal text-muted-foreground">{transaction.description || "No description"}</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-4 text-right">
                    <div>
                      <p className={`text-lg font-semibold ${isIncome ? "text-income" : "text-expense"}`}>
                        {isIncome ? "+" : "-"}₹{transaction.amount.toLocaleString("en-IN")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(transaction._id)}
                      className="rounded-lg p-2 text-muted-foreground opacity-0 transition hover:bg-danger/10 hover:text-danger group-hover:opacity-100"
                      title="Delete transaction"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
