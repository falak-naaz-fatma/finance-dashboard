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
import type { LucideIcon } from "lucide-react";
import { format } from "date-fns";

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
const categoryIcons: Record<string, LucideIcon> = {
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [pickerView, setPickerView] = useState<"none" | "month" | "year">("none");
  const [openCalendar, setOpenCalendar] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

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

      if (!calendarRef.current?.contains(event.target as Node)) {
        setOpenCalendar(false);
        setPickerView("none");
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
            <div className="space-y-2">
              <Label className="text-base font-semibold text-foreground">Date</Label>
              <div className="relative" ref={calendarRef}>
                <button
                  type="button"
                  onClick={() => setOpenCalendar((prev) => !prev)}
                  className="
                    w-full h-12 flex items-center justify-between
                    rounded-xl border border-white/10
                    bg-white/5 px-4 text-sm text-foreground
                  "
                >
                  <span>
                    {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Select date"}
                  </span>

                  <CalendarDays className="size-4 text-muted-foreground" />
                </button>

                {openCalendar && (
                  <div className="calendar-picker absolute right-0 bottom-full z-50 mb-2 w-[300px] rounded-2xl border border-border bg-card p-4 shadow-2xl outline-none">
                    <div className="relative mb-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          const date = new Date(calendarMonth);
                          date.setMonth(date.getMonth() - 1);
                          setCalendarMonth(date);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none"
                      >
                        ‹
                      </button>

                      <button
                        type="button"
                        onClick={() => setPickerView((view) => (view === "none" ? "month" : "none"))}
                        className="text-sm font-semibold text-foreground transition-colors hover:text-primary focus:outline-none"
                      >
                        {calendarMonth.toLocaleString("en-IN", {
                          month: "long",
                          year: "numeric",
                        })}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const date = new Date(calendarMonth);
                          date.setMonth(date.getMonth() + 1);
                          setCalendarMonth(date);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none"
                      >
                        ›
                      </button>

                      {pickerView !== "none" && (
                        <div className="calendar-picker absolute left-1/2 top-10 z-50 w-[220px] -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                          {pickerView === "month" && (
                            <>
                              <button
                                type="button"
                                onClick={() => setPickerView("year")}
                                className="flex w-full items-center justify-between border-b border-border bg-primary/10 px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/15 focus:outline-none"
                              >
                                <span>{calendarMonth.getFullYear()}</span>
                                <span className="text-xs opacity-60">tap to change ›</span>
                              </button>

                              <div className="grid grid-cols-3 gap-1 p-2">
                                {[
                                  "Jan",
                                  "Feb",
                                  "Mar",
                                  "Apr",
                                  "May",
                                  "Jun",
                                  "Jul",
                                  "Aug",
                                  "Sep",
                                  "Oct",
                                  "Nov",
                                  "Dec",
                                ].map((month, index) => {
                                  const isSelected = calendarMonth.getMonth() === index;

                                  return (
                                    <button
                                      key={month}
                                      type="button"
                                      onClick={() => {
                                        const date = new Date(calendarMonth);
                                        date.setMonth(index);
                                        setCalendarMonth(date);
                                        setPickerView("none");
                                      }}
                                      className={`rounded-lg py-2.5 text-sm font-medium transition-colors focus:outline-none ${isSelected
                                        ? "bg-primary text-primary-foreground"
                                        : "text-foreground hover:bg-accent"
                                        }`}
                                    >
                                      {month}
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          )}

                          {pickerView === "year" && (
                            <>
                              <button
                                type="button"
                                onClick={() => setPickerView("month")}
                                className="flex w-full items-center gap-2 border-b border-border bg-primary/10 px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/15 focus:outline-none"
                              >
                                <span>‹</span>
                                <span>Select Year</span>
                              </button>

                              <div className="max-h-52 overflow-y-auto">
                                {Array.from({ length: 30 }, (_, index) => new Date().getFullYear() - index)
                                  .map((year) => {
                                    const isSelected = calendarMonth.getFullYear() === year;

                                    return (
                                      <button
                                        key={year}
                                        type="button"
                                        onClick={() => {
                                          const date = new Date(calendarMonth);
                                          date.setFullYear(year);
                                          setCalendarMonth(date);
                                          setPickerView("month");
                                        }}
                                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors focus:outline-none ${isSelected
                                          ? "bg-primary font-semibold text-primary-foreground"
                                          : "text-foreground hover:bg-accent"
                                          }`}
                                      >
                                        {year}
                                      </button>
                                    );
                                  })}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mb-2 grid grid-cols-7">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                        <div key={day} className="py-1 text-center text-xs font-semibold text-muted-foreground">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-y-1">
                      {(() => {
                        const year = calendarMonth.getFullYear();
                        const month = calendarMonth.getMonth();
                        const firstDay = new Date(year, month, 1).getDay();
                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                        const today = new Date();
                        const cells = [];

                        for (let i = 0; i < firstDay; i++) {
                          cells.push(<div key={`empty-${i}`} />);
                        }

                        for (let day = 1; day <= daysInMonth; day++) {
                          const date = new Date(year, month, day);
                          const isSelected =
                            selectedDate &&
                            selectedDate.getDate() === day &&
                            selectedDate.getMonth() === month &&
                            selectedDate.getFullYear() === year;
                          const isToday =
                            today.getDate() === day &&
                            today.getMonth() === month &&
                            today.getFullYear() === year;

                          cells.push(
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                setSelectedDate(date);
                                setValue("date", format(date, "yyyy-MM-dd"));
                                setOpenCalendar(false);
                                setPickerView("none");
                              }}
                              className={`
                                flex h-9 w-full items-center justify-center rounded-xl
                                text-sm font-medium transition-all
                                focus:outline-none
                                ${isSelected
                                  ? "scale-105 bg-primary text-primary-foreground shadow-md"
                                  : isToday
                                    ? "border border-primary font-bold text-primary"
                                    : "text-foreground hover:bg-accent hover:text-foreground"
                                }
                              `}
                            >
                              {day}
                            </button>,
                          );
                        }

                        return cells;
                      })()}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <span className="text-xs text-muted-foreground">
                        {selectedDate ? format(selectedDate, "dd MMM yyyy") : "No date selected"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const today = new Date();
                          setSelectedDate(today);
                          setCalendarMonth(today);
                          setValue("date", format(today, "yyyy-MM-dd"));
                          setOpenCalendar(false);
                          setPickerView("none");
                        }}
                        className="text-xs font-semibold text-primary transition-colors hover:text-primary/80 focus:outline-none"
                      >
                        Today
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

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
