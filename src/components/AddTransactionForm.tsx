"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useState } from "react";
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

// Validation schema
const transactionSchema = z.object({
    type: z.enum(["income", "expense"]),
    category: z.string().min(1, "Please select a category"),
    amount: z.number().min(1, "Amount must be greater than 0"),
    description: z.string().optional(),
});

type TransactionForm = z.infer<typeof transactionSchema>;

const incomeCategories = ["Salary", "Freelance", "Business", "Investment", "Other"];
const expenseCategories = ["Food", "Travel", "Shopping", "Bills", "Health", "Education", "Other"];

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
        defaultValues: { type: "expense" },
    });

    const onSubmit = async (data: TransactionForm) => {
        setLoading(true);
        try {
            const response = await fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data,
                    userId: (session?.user as any)?.id,
                }),
            });

            if (response.ok) {
                reset();
                setSelectedType("expense");
                onSuccess?.(); // refresh list after adding
                alert("Transaction added successfully!");
            } else {
                alert("Something went wrong. Please try again.");
            }
        } catch (error) {
            alert("Error adding transaction.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Add Transaction</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">

                {/* Type selector — Income or Expense */}
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => { setSelectedType("income"); setValue("type", "income"); }}
                        className={`flex-1 py-2 rounded-md font-medium transition-colors ${selectedType === "income"
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-600"
                            }`}
                    >
                        + Income
                    </button>
                    <button
                        type="button"
                        onClick={() => { setSelectedType("expense"); setValue("type", "expense"); }}
                        className={`flex-1 py-2 rounded-md font-medium transition-colors ${selectedType === "expense"
                            ? "bg-red-500 text-white"
                            : "bg-gray-100 text-gray-600"
                            }`}
                    >
                        - Expense
                    </button>
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1">
                    <Label>Category</Label>
                    <Select onValueChange={(val) => setValue("category", val)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            {(selectedType === "income" ? incomeCategories : expenseCategories).map(
                                (cat) => (
                                    <SelectItem key={cat} value={cat.toLowerCase()}>
                                        {cat}
                                    </SelectItem>
                                )
                            )}
                        </SelectContent>
                    </Select>
                    {errors.category && (
                        <p className="text-red-500 text-sm">{errors.category.message}</p>
                    )}
                </div>

                {/* Amount */}
                <div className="flex flex-col gap-1">
                    <Label>Amount (₹)</Label>
                    <Input
                        type="number"
                        placeholder="Enter amount"
                        {...register("amount")}
                    />
                    {errors.amount && (
                        <p className="text-red-500 text-sm">{errors.amount.message}</p>
                    )}
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1">
                    <Label>Description (optional)</Label>
                    <Input
                        type="text"
                        placeholder="e.g. Lunch with friends"
                        {...register("description")}
                    />
                </div>

                {/* Submit */}
                <Button
                    onClick={handleSubmit(onSubmit)}
                    disabled={loading}
                    className="w-full"
                >
                    {loading ? "Adding..." : "Add Transaction"}
                </Button>

            </CardContent>
        </Card>
    );
}