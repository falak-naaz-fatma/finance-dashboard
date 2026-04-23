import mongoose, { Schema } from "mongoose";

const TransactionSchema = new Schema({
    userId: { type: String, required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
});

export default mongoose.models.Transaction ||
    mongoose.model("Transaction", TransactionSchema);