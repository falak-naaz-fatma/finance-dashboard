"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, IndianRupee, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Please select a category"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  description: z.string().optional(),
  date: z.string().min(1, "Please select a date"),
});

type TransactionForm = z.infer<typeof transactionSchema>;

const incomeCategories = ["Salary", "Freelance", "Business", "Investment", "Other"];
const expenseCategories = ["Food", "Travel", "Shopping", "Bills", "Health", "Education", "Entertainment", "Other"];

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

export default function AddTransactionForm({ onSuccess }: { onSuccess?: () => void }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<"income" | "expense">("expense");
  const [selectedCategory, setSelectedCategory] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { type: "expense", date: todayValue() },
  });

  const onSubmit = async (data: TransactionForm) => {
    setLoading(true);
    try {
      const userId = (session?.user as { id?: string })?.id;
      if (!userId) return;
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          date: new Date(data.date),
          userId,
        }),
      });

      if (response.ok) {
        reset({ type: "expense", date: todayValue(), amount: 0, category: "", description: "" });
        setSelectedType("expense");
        setSelectedCategory("");
        onSuccess?.();
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Error adding transaction.");
    } finally {
      setLoading(false);
    }
  };

  const categories = selectedType === "income" ? incomeCategories : expenseCategories;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
    >
    <Card className="glow-shell min-h-[190px] rounded-2xl border border-white/10 bg-card/60 py-5 shadow-card backdrop-blur-xl">
      <CardHeader className="px-8">
        <CardTitle className="text-lg font-semibold">Add Transaction</CardTitle>
        <p className="text-sm font-normal text-muted-foreground">Track a new income or expense</p>
      </CardHeader>
      <CardContent className="px-8">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="grid rounded-2xl border border-white/10 bg-white/5 p-1 sm:grid-cols-2">
            {(["income", "expense"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setSelectedType(type);
                  setValue("type", type);
                  setValue("category", "");
                  setSelectedCategory("");
                }}
                className={`h-11 rounded-[12px] text-base font-semibold capitalize transition ${selectedType === type
                  ? type === "income"
                    ? "bg-income text-background"
                    : "bg-expense text-white"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold text-foreground">Category</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {categories.map((category) => {
                const value = category.toLowerCase();
                const active = selectedCategory === value;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(value);
                      setValue("category", value);
                    }}
                    className={`flex h-11 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition ${active
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                      }`}
                  >
                    <Tags className="size-4" />
                    {category}
                  </button>
                );
              })}
            </div>
            {errors.category && <p className="text-sm text-danger">{errors.category.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold text-foreground">Amount</Label>
            <div className="relative">
              <IndianRupee className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="number"
                placeholder="0"
                className="h-12 rounded-xl border border-white/10 bg-white/5 pl-10 text-lg font-normal text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/70 focus:ring-2 focus:ring-primary/30"
                {...register("amount", { valueAsNumber: true })}
              />
            </div>
            {errors.amount && <p className="text-sm text-danger">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold text-foreground">Description (optional)</Label>
            <Input
              type="text"
              placeholder="e.g. Lunch with team"
              className="h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-lg font-normal text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/70 focus:ring-2 focus:ring-primary/30"
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold text-foreground">Date</Label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                className="h-12 rounded-xl border border-white/10 bg-white/5 pl-10 text-lg font-normal text-foreground outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/30"
                {...register("date")}
              />
            </div>
            {errors.date && <p className="text-sm text-danger">{errors.date.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-1 h-14 rounded-xl bg-gradient-fintech text-base font-semibold text-white shadow-glow transition hover:scale-[1.01] hover:opacity-95"
          >
            {loading ? "Adding..." : "Add Transaction"}
          </Button>
        </form>
      </CardContent>
    </Card>
    </motion.div>
  );
}
