"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  ChevronDown,
  IndianRupee,
  Tags,
  Utensils,
  Plane,
  ShoppingBag,
  Receipt,
  HeartPulse,
  GraduationCap,
  Film,
  Wallet,
} from "lucide-react";

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

// 🔥 Category → Icon map
const categoryIcons: Record<string, any> = {
  food: Utensils,
  travel: Plane,
  shopping: ShoppingBag,
  bills: Receipt,
  health: HeartPulse,
  education: GraduationCap,
  entertainment: Film,
  other: Wallet,
  salary: Wallet,
  freelance: Wallet,
  business: Wallet,
  investment: Wallet,
};

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

export default function AddTransactionForm({ onSuccess }: { onSuccess?: () => void }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<"income" | "expense">("expense");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
        setOpen(false);
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

  const SelectedIcon = categoryIcons[selectedCategory] || Tags;

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

            {/* Type Toggle */}
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
                    setOpen(false);
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

            {/* CATEGORY DROPDOWN */}
            <div className="relative space-y-2" ref={dropdownRef}>
              <Label className="text-base font-semibold text-foreground">Category</Label>

              <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex h-12 w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-foreground transition hover:bg-white/10"
              >
                <span className="flex items-center gap-2">
                  <SelectedIcon className="size-4 text-muted-foreground" />
                  {selectedCategory
                    ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
                    : "Select category"}
                </span>

                <ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-card shadow-xl"
                  >
                    <div className="max-h-52 overflow-y-auto">
                      {categories.map((category) => {
                        const value = category.toLowerCase();
                        const active = selectedCategory === value;
                        const Icon = categoryIcons[value] || Tags;

                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(value);
                              setValue("category", value);
                              setOpen(false);
                            }}
                            className={`flex w-full items-center gap-2 px-4 py-3 text-sm transition ${active
                                ? "bg-primary/15 text-primary"
                                : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
                              }`}
                          >
                            <Icon className="size-4 text-muted-foreground" />
                            {category}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {errors.category && <p className="text-sm text-danger">{errors.category.message}</p>}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label className="text-base font-semibold text-foreground">Amount</Label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0"
                  className="h-12 rounded-xl border border-white/10 bg-white/5 pl-10 text-lg text-foreground"
                  {...register("amount", { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Description */}
            <Input
              placeholder="Description"
              className="h-12 rounded-xl border border-white/10 bg-white/5"
              {...register("description")}
            />

            {/* Date */}
            <Input type="date" {...register("date")} />

            {/* Submit */}
            <Button type="submit" disabled={loading} className="h-14 rounded-xl bg-gradient-fintech text-white">
              {loading ? "Adding..." : "Add Transaction"}
            </Button>

          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}