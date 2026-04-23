"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import AddTransactionForm from "@/components/AddTransactionForm";
import TransactionList from "@/components/TransactionList";
import SummaryCards from "@/components/SummaryCards";
import ExpensePieChart from "@/components/ExpensePieChart";
import MonthlyBarChart from "@/components/MonthlyBarChart";
import MonthFilter from "@/components/MonthFilter";

export default function DashboardPage() {
    const { data: session } = useSession();
    const [refresh, setRefresh] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState("");

    const handleSuccess = () => setRefresh((prev) => !prev);

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-white border-b shadow-sm px-4 sm:px-8 py-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold">💳 Finance Dashboard</h1>
                        <p className="text-gray-500 text-sm hidden sm:block">
                            Welcome, {session?.user?.name} 👋
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* User avatar */}
                        {session?.user?.image && (
                            <img
                                src={session.user.image}
                                alt="avatar"
                                className="w-8 h-8 rounded-full hidden sm:block"
                            />
                        )}
                        <button
                            onClick={() => signOut()}
                            className="px-3 py-1.5 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Page content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 flex flex-col gap-6">

                {/* Month Filter */}
                <MonthFilter
                    selectedMonth={selectedMonth}
                    onChange={setSelectedMonth}
                />

                {/* Summary Cards */}
                <SummaryCards refresh={refresh} selectedMonth={selectedMonth} />

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ExpensePieChart refresh={refresh} />
                    <MonthlyBarChart refresh={refresh} />
                </div>

                {/* Form + List */}
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="w-full lg:w-1/3">
                        <AddTransactionForm onSuccess={handleSuccess} />
                    </div>
                    <div className="w-full lg:w-2/3">
                        <TransactionList
                            refresh={refresh}
                            selectedMonth={selectedMonth}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}
