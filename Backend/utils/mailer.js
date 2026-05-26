const nodemailer = require('nodemailer')

async function sendResetEmail({ to, name, resetUrl }) {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  const html = `
    <div style="font-family:Inter,sans-serif;background:#0a0a0a;color:#ffffff;padding:40px;max-width:520px;margin:0 auto;border-radius:16px;border:1px solid #2d2d2d">
      <div style="text-align:center;margin-bottom:32px">
        <h1 style="font-family:Oswald,sans-serif;font-size:28px;color:#e63946;margin:0;letter-spacing:2px">POWERZONE</h1>
      </div>
      <h2 style="font-size:20px;font-weight:700;margin:0 0 12px">Reset Your Password</h2>
      <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 24px">Hi ${name}, we received a request to reset your PowerZone account password. Click the button below to choose a new password.</p>
      <a href="${resetUrl}" style="display:inline-block;background:#e63946;color:#ffffff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:50px;text-decoration:none;letter-spacing:0.5px">Reset Password</a>
      <p style="color:#6b7280;font-size:12px;margin:24px 0 0;line-height:1.6">This link expires in <strong style="color:#ffffff">1 hour</strong>. If you did not request a password reset, you can safely ignore this email.</p>
      <hr style="border:none;border-top:1px solid #2d2d2d;margin:24px 0"/>
      <p style="color:#4b5563;font-size:11px;margin:0">© PowerZone Gym · Do not reply to this email</p>
    </div>
  `

  await transporter.sendMail({
    from: `"PowerZone Gym" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset Your PowerZone Password',
    html,
  })
}

module.exports = { sendResetEmail }
