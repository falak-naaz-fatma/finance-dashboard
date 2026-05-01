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
        <Card className="w-full rounded-2xl border border-white/10 bg-card/60 shadow-card backdrop-blur-xl">
            <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                        Filter by Month:
                    </p>
                    <div className="flex gap-2 flex-wrap">
                        {/* All time button */}
                        <button
                            onClick={() => onChange("")}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedMonth === ""
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-accent"
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
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-accent"
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
