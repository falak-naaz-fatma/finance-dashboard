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
    from: `"Spendly" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your Spendly password",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset your Spendly password</title>
</head>
<body style="margin:0; padding:0; background-color:#F4F6FB; font-family: Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#F4F6FB; padding: 48px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="520" cellpadding="0" cellspacing="0" border="0"
          style="
            background-color: #FFFFFF;
            border-radius: 20px;
            border: 1px solid #E2E8F0;
            box-shadow: 0 4px 32px rgba(99,102,241,0.08);
            overflow: hidden;
            max-width: 520px;
            width: 100%;
          ">

          <!-- Top gradient accent bar -->
          <tr>
            <td style="
              height: 4px;
              background: linear-gradient(90deg, #7C5CFF, #4F46E5, #7C5CFF);
              padding: 0;
              font-size: 0;
              line-height: 0;
            ">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 28px;">

              <!-- Logo -->
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <img
                      src="${process.env.NEXTAUTH_URL}/logo.jpg"
                      alt="Spendly"
                      width="64"
                      height="64"
                      style="border-radius: 18px; display: block; margin: 0 auto;"
                    />
                  </td>
                </tr>
              </table>

              <h1 style="
                margin: 16px 0 4px;
                font-size: 26px;
                font-weight: 800;
                color: #1E1B4B;
                letter-spacing: -0.5px;
              ">Spendly</h1>

              <p style="
                margin: 0;
                font-size: 13px;
                color: #94A3B8;
                letter-spacing: 0.3px;
              ">Smart Spending Tracker</p>

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height:1px; background:#E2E8F0; font-size:0; line-height:0;">&nbsp;</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 40px;">

              <!-- Lock badge -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="
                    background: #EEF2FF;
                    border: 1px solid #C7D2FE;
                    border-radius: 12px;
                    padding: 10px 14px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #4F46E5;
                  ">
                    🔐 &nbsp; Password Reset Request
                  </td>
                </tr>
              </table>

              <h2 style="
                margin: 0 0 12px;
                font-size: 22px;
                font-weight: 700;
                color: #1E1B4B;
                letter-spacing: -0.3px;
              ">Reset your password</h2>

              <p style="
                margin: 0 0 8px;
                font-size: 15px;
                color: #64748B;
                line-height: 1.7;
              ">
                We received a request to reset the password for your Spendly account associated with
              </p>

              <!-- Email highlight box -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%"
                style="margin-bottom: 16px;">
                <tr>
                  <td style="
                    background: #F5F3FF;
                    border: 1px solid #DDD6FE;
                    border-radius: 10px;
                    padding: 10px 16px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #7C3AED;
                  ">
                    📧 &nbsp; ${email}
                  </td>
                </tr>
              </table>

              <p style="
                margin: 0 0 28px;
                font-size: 15px;
                color: #64748B;
                line-height: 1.7;
              ">
                Click the button below to create a new password. This link will expire in
                <strong style="color: #1E1B4B;">1 hour</strong>.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}"
                      style="
                        display: inline-block;
                        background: linear-gradient(135deg, #7C5CFF 0%, #4F46E5 100%);
                        color: #FFFFFF;
                        text-decoration: none;
                        font-size: 16px;
                        font-weight: 700;
                        padding: 16px 48px;
                        border-radius: 14px;
                        letter-spacing: 0.2px;
                        box-shadow: 0 4px 20px rgba(124,92,255,0.35);
                      ">
                      Reset Password →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry note -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <span style="
                      display: inline-block;
                      background: #FFF7ED;
                      border: 1px solid #FED7AA;
                      border-radius: 8px;
                      padding: 6px 14px;
                      font-size: 12px;
                      color: #C2410C;
                      font-weight: 600;
                    ">
                      ⏱ &nbsp; This link expires in 1 hour
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Fallback URL box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="margin-bottom: 24px;">
                <tr>
                  <td style="
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    border-radius: 12px;
                    padding: 16px;
                  ">
                    <p style="
                      margin: 0 0 6px;
                      font-size: 11px;
                      color: #94A3B8;
                      text-transform: uppercase;
                      letter-spacing: 0.8px;
                      font-weight: 700;
                    ">Button not working? Copy this link</p>
                    <p style="
                      margin: 0;
                      font-size: 12px;
                      color: #7C5CFF;
                      word-break: break-all;
                      line-height: 1.6;
                    ">${resetUrl}</p>
                  </td>
                </tr>
              </table>

              <!-- Warning box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="
                    background: #FFF1F2;
                    border: 1px solid #FECDD3;
                    border-radius: 12px;
                    padding: 14px 16px;
                  ">
                    <p style="
                      margin: 0;
                      font-size: 13px;
                      color: #BE123C;
                      line-height: 1.6;
                    ">
                      ⚠️ &nbsp; <strong>Didn't request this?</strong>
                      If you didn't request a password reset, please ignore this email.
                      Your password will not be changed.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height:1px; background:#E2E8F0; font-size:0; line-height:0;">&nbsp;</div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px;" align="center">

              <!-- Social/brand row -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="
                    background: linear-gradient(135deg, #7C5CFF 0%, #4F46E5 100%);
                    border-radius: 10px;
                    padding: 8px 20px;
                  ">
                    <span style="
                      font-size: 14px;
                      font-weight: 800;
                      color: #FFFFFF;
                      letter-spacing: 0.5px;
                    ">SP &nbsp; Spendly</span>
                  </td>
                </tr>
              </table>

              <p style="
                margin: 0;
                font-size: 12px;
                color: #CBD5E1;
                text-align: center;
                line-height: 1.8;
              ">
                © 2026 Spendly · Smart Spending Tracker<br/>
                Sent to ${email} · This is an automated email, please do not reply.
              </p>

            </td>
          </tr>

        </table>
        <!-- End card -->

      </td>
    </tr>
  </table>

</body>
</html>
    `,
  });
}
