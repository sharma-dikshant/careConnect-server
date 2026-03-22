export function appointmentCloseOtpTemplate(name: string, otp: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Appointment Closing OTP – CareConnect</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a73e8,#0d47a1);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:0.5px;">CareConnect</h1>
              <p style="margin:6px 0 0;color:#c8d8f8;font-size:13px;">Connecting Care, Empowering Health</p>
            </td>
          </tr>

          <!-- Icon Banner -->
          <tr>
            <td style="background:#fff3e0;padding:20px 40px;text-align:center;border-bottom:1px solid #ffe0b2;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#e65100;">✅ Appointment Closing Confirmation</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 32px;">
              <p style="margin:0 0 8px;font-size:16px;color:#333333;">Hi <strong>${name}</strong>,</p>
              <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.6;">
                Use the OTP below to confirm the closing of your appointment. This code expires in <strong>15 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:20px 0;">
                    <div style="display:inline-block;background:#fff8e1;border:2px dashed #fb8c00;border-radius:10px;padding:20px 48px;">
                      <p style="margin:0;font-size:38px;font-weight:800;letter-spacing:10px;color:#e65100;font-family:'Courier New',monospace;">${otp}</p>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:13px;color:#888888;line-height:1.6;">
                If you did not request to close this appointment, please contact your healthcare provider immediately.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fc;padding:20px 40px;text-align:center;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:12px;color:#aaaaaa;">© ${new Date().getFullYear()} CareConnect. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
