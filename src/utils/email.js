const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendVerificationEmail(email, token) {
  const link = `http://localhost:3000/api/auth/verify/${token}`;

  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: email,
    subject: "Verify your email",
    html: `
      <h2>Email Verification</h2>
      <p>Click below to verify your account:</p>
      <a href="${link}">Verify Email</a>
    `,
  });
}

module.exports = { sendVerificationEmail };