import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendResetEmail(email: string, resetUrl: string) {
    await transporter.sendMail({
        from: `"FinTrack" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset your FinTrack password",
        html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0B0F1A; color: #E8EAF0; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #7C5CFF, #4F46E5); border-radius: 14px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 18px; font-weight: 700; color: #FFFFFF;">FT</span>
          </div>
          <h1 style="font-size: 24px; font-weight: 700; margin: 0;">FinTrack</h1>
        </div>

        <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">Reset your password</h2>
        <p style="color: #9CA3AF; margin-bottom: 24px; line-height: 1.6;">
          We received a request to reset your password.
          Click the button below to create a new password.
          This link expires in <strong style="color: #E8EAF0;">1 hour</strong>.
        </p>

        <a href="${resetUrl}"
           style="display: block; text-align: center; background: linear-gradient(135deg, #7C5CFF, #4F46E5); color: white; padding: 14px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px; margin-bottom: 24px;">
          Reset Password
        </a>

        <p style="color: #6B7280; font-size: 13px; line-height: 1.6;">
          If you did not request this, you can safely ignore this email.
          Your password will not be changed.
        </p>

        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #1F2937; color: #6B7280; font-size: 12px; text-align: center;">
          This link expires in 1 hour for security reasons.
        </div>
      </div>
    `,
    });
}
