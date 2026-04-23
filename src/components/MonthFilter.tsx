"use client";

import { Card, CardContent } from "@/components/ui/card";

type Props = {
    selectedMonth: string;
    onChange: (month: string) => void;
};

export default function MonthFilter({ selectedMonth, onChange }: Props) {
    // Generate last 12 months
    const months = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const value = date.toISOString().slice(0, 7); // "2024-04"
        const label = date.toLocaleString("en-IN", {
            month: "long",
            year: "numeric",
        });
        return { value, label };
    });

    return (
        <Card className="w-full">
            <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <p className="text-sm font-medium text-gray-500 whitespace-nowrap">
                        Filter by Month:
                    </p>
                    <div className="flex gap-2 flex-wrap">
                        {/* All time button */}
                        <button
                            onClick={() => onChange("")}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedMonth === ""
                                    ? "bg-gray-800 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            All Time
                        </button>

                        {/* Month buttons — show last 6 */}
                        {months.slice(0, 6).map((m) => (
                            <button
                                key={m.value}
                                onClick={() => onChange(m.value)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedMonth === m.value
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}