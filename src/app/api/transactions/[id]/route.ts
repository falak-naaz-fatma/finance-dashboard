import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";
import { NextRequest, NextResponse } from "next/server";

// DELETE a transaction
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    await Transaction.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Deleted successfully" });
}