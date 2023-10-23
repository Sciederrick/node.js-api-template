require("dotenv").config();
const nodemailer = require("nodemailer");

const passwordReset = async (toEmail, resetLink) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.mailgun.org",
      port: process.env.MAILGUN_PORT,
      auth: {
        user: process.env.MAILGUN_EMAIL,
        pass: process.env.MAILGUN_SMTP_PASSWORD,
      },
    });

    let info = await transporter.sendMail({
      from: "nodejs-api-template@sandbox1ffc61987899402f982d71e63dd5b800.mailgun.org",
      to: toEmail, // toEmail,
      subject: "Password Reset",
      text: `Here is your password reset link: ${resetLink}`,
    });

    console.log("Message sent: %s", info.messageId);
		return true
  } catch (err) {
		console.error(err);
		return false
	}
};

module.exports = passwordReset;
