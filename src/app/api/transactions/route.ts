import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";
import { NextRequest, NextResponse } from "next/server";

// GET all transactions
export async function GET(req: NextRequest) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const transactions = await Transaction.find({ userId }).sort({ date: -1 });
    return NextResponse.json(transactions);
}

// POST new transaction
export async function POST(req: NextRequest) {
    await connectDB();
    const body = await req.json();
    const transaction = await Transaction.create(body);
    return NextResponse.json(transaction, { status: 201 });
}