export function welcomeTemplate(
  name: string,
  role: 'doctor' | 'patient',
): string {
  const greeting = role === 'doctor' ? `Dr. ${name}` : name;
  const roleMessage =
    role === 'doctor'
      ? 'You can now log in and start managing your patients through CareConnect.'
      : 'You can now log in and connect with your healthcare providers through CareConnect.';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to CareConnect</title>
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

          <!-- Welcome Banner -->
          <tr>
            <td style="background:#e8f0fe;padding:24px 40px;text-align:center;border-bottom:1px solid #d0e0fc;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#1a73e8;">🎉 Welcome aboard!</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 32px;">
              <p style="margin:0 0 12px;font-size:16px;color:#333333;">Hi <strong>${greeting}</strong>,</p>
              <p style="margin:0 0 20px;font-size:15px;color:#555555;line-height:1.7;">
                Your CareConnect account has been successfully created. ${roleMessage}
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#555555;line-height:1.7;">
                If you have any questions, our support team is always here to help.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#1a73e8;border-radius:8px;padding:14px 32px;">
                    <a href="#" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">Log In to CareConnect</a>
                  </td>
                </tr>
              </table>
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
