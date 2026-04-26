"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      const userId = (session?.user as { id?: string } | undefined)?.id || "test123";
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
    <Card className="rounded-[8px] border border-white/10 bg-[#15161f]/90 py-7 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
      <CardHeader className="px-8">
        <CardTitle className="text-lg font-semibold">Add Transaction</CardTitle>
        <p className="text-sm font-normal text-zinc-400">Track a new income or expense</p>
      </CardHeader>
      <CardContent className="px-8">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="grid rounded-[14px] bg-white/[0.04] p-1 sm:grid-cols-2">
            {(["income", "expense"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setSelectedType(type);
                  setValue("type", type);
                  setValue("category", "");
                }}
                className={`h-11 rounded-[12px] text-base font-semibold capitalize transition ${
                  selectedType === type
                    ? type === "income"
                      ? "bg-[#22d3a6] text-[#06110e]"
                      : "bg-[#ff3f6c] text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold text-zinc-100">Category</Label>
            <Select onValueChange={(value) => setValue("category", value)} key={selectedType}>
              <SelectTrigger className="h-12 w-full rounded-[12px] border-white/10 bg-[#07080d] px-4 text-lg font-normal text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#0b0c12] text-white">
                {categories.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-[#ff6b8a]">{errors.category.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold text-zinc-100">Amount</Label>
            <div className="relative">
              <IndianRupee className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <Input
                type="number"
                placeholder="0"
                className="h-12 rounded-[12px] border-white/10 bg-[#07080d] pl-10 text-lg font-normal text-white placeholder:text-zinc-500"
                {...register("amount", { valueAsNumber: true })}
              />
            </div>
            {errors.amount && <p className="text-sm text-[#ff6b8a]">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold text-zinc-100">Description (optional)</Label>
            <Input
              type="text"
              placeholder="e.g. Lunch with team"
              className="h-12 rounded-[12px] border-white/10 bg-[#07080d] px-4 text-lg font-normal text-white placeholder:text-zinc-500"
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold text-zinc-100">Date</Label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <Input
                type="date"
                className="h-12 rounded-[12px] border-white/10 bg-[#07080d] pl-10 text-lg font-normal text-white"
                {...register("date")}
              />
            </div>
            {errors.date && <p className="text-sm text-[#ff6b8a]">{errors.date.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-1 h-14 rounded-[12px] bg-gradient-to-r from-[#7657ff] to-[#c052f4] text-base font-semibold text-white hover:opacity-95"
          >
            {loading ? "Adding..." : "Add Transaction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
