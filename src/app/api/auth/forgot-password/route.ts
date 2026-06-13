import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { sendResetEmail } from "@/lib/email";
import User from "@/models/User";

const responseMessage = "If this email exists you will receive a reset link";

function isEmailAuthError(error: unknown) {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "EAUTH"
    );
}

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: responseMessage });
        }

        await connectDB();

        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ message: responseMessage });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    resetToken,
                    resetTokenExpiry,
                },
            }
        );

        const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

        try {
            await sendResetEmail(email, resetUrl);
        } catch (error) {
            console.error("Reset email delivery error:", error);

            if (isEmailAuthError(error)) {
                return NextResponse.json(
                    { error: "Email service login failed. Check EMAIL_USER and EMAIL_PASS." },
                    { status: 500 }
                );
            }

            return NextResponse.json(
                { error: "Could not send reset email. Please try again later." },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: responseMessage });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
