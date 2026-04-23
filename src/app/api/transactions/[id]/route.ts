import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";
import { NextRequest, NextResponse } from "next/server";

// DELETE a transaction
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const { id } = await params;
    await Transaction.findByIdAndDelete(id);
    return NextResponse.json({ message: "Deleted successfully" });
}
