import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";
import { NextRequest, NextResponse } from "next/server";

type TransactionRecord = {
  type: "income" | "expense";
  category: string;
  amount: number;
  date: Date | string;
};

function monthStart(offset = 0) {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  date.setMonth(date.getMonth() + offset);
  return date;
}

function isInRange(value: Date | string, start: Date, end: Date) {
  const date = new Date(value);
  return date >= start && date < end;
}

function categoryLabel(category: string) {
  return category
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function currency(value: number) {
  return `Rs. ${Math.round(value).toLocaleString("en-IN")}`;
}

function formatDay(value: Date | string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
  });
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ insights: [] }, { status: 400 });
    }

    const transactions = (await Transaction.find({ userId })
      .select("type category amount date")
      .lean()) as TransactionRecord[];

    const currentStart = monthStart(0);
    const nextStart = monthStart(1);
    const previousStart = monthStart(-1);
    const today = new Date();
    const daysElapsed = Math.max(1, today.getDate());
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    const currentTransactions = transactions.filter((transaction) =>
      isInRange(transaction.date, currentStart, nextStart)
    );
    const currentExpenses = currentTransactions.filter((transaction) => transaction.type === "expense");
    const previousExpenses = transactions.filter(
      (transaction) => transaction.type === "expense" && isInRange(transaction.date, previousStart, currentStart)
    );

    const income = currentTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const expense = currentExpenses.reduce((sum, transaction) => sum + transaction.amount, 0);
    const previousExpense = previousExpenses.reduce((sum, transaction) => sum + transaction.amount, 0);
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
    const projectedExpense = (expense / daysElapsed) * daysInMonth;

    const categoryTotals = currentExpenses.reduce<Record<string, number>>((totals, transaction) => {
      totals[transaction.category] = (totals[transaction.category] || 0) + transaction.amount;
      return totals;
    }, {});
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

    const dailyExpenseTotals = currentExpenses.reduce<Record<string, { amount: number; date: Date | string }>>(
      (totals, transaction) => {
        const key = new Date(transaction.date).toISOString().slice(0, 10);
        totals[key] = {
          amount: (totals[key]?.amount || 0) + transaction.amount,
          date: transaction.date,
        };
        return totals;
      },
      {}
    );
    const highestExpenseDay = Object.values(dailyExpenseTotals).sort((a, b) => b.amount - a.amount)[0];

    const weekendSpend = currentExpenses
      .filter((transaction) => {
        const day = new Date(transaction.date).getDay();
        return day === 0 || day === 6;
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const weekendShare = expense > 0 ? (weekendSpend / expense) * 100 : 0;

    const insights: string[] = [];

    if (topCategory) {
      insights.push(
        `You spent most on ${categoryLabel(topCategory[0])}: ${currency(topCategory[1])} this month.`
      );
    } else {
      insights.push("Add a few expenses this month to unlock category insights.");
    }

    if (previousExpense > 0) {
      const delta = ((expense - previousExpense) / previousExpense) * 100;
      insights.push(
        delta >= 0
          ? `Your spending is ${Math.round(delta)}% higher than last month.`
          : `Your spending is ${Math.abs(Math.round(delta))}% lower than last month.`
      );
    } else if (expense > 0) {
      insights.push(`You have logged ${currency(expense)} in expenses so far this month.`);
    } else {
      insights.push("No expenses recorded for this month yet.");
    }

    if (income > 0) {
      insights.push(`You are saving ${Math.round(savingsRate)}% of your income this month.`);
    } else {
      insights.push("Add income entries to calculate your monthly savings rate.");
    }

    if (highestExpenseDay) {
      insights.push(
        `Your highest expense day was ${formatDay(highestExpenseDay.date)} at ${currency(highestExpenseDay.amount)}.`
      );
    }

    if (expense > 0) {
      insights.push(`At this pace, your projected month-end spending is ${currency(projectedExpense)}.`);
    }

    if (weekendShare >= 40) {
      insights.push(`Weekend purchases make up ${Math.round(weekendShare)}% of this month's expenses.`);
    }

    return NextResponse.json({ insights: insights.slice(0, 5) });
  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json({ insights: [] }, { status: 500 });
  }
}
