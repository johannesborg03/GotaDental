const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Replace with your provider's SMTP host
  port: 587, // Use 465 for SSL, 587 for TLS
  secure: false, // Set to true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

transporter.verify((error, success) => {
    if (error) {
      console.error("SMTP Connection Error:", error);
    } else {
      console.log("SMTP Server is Ready");
    }
  });
  

module.exports = { sendEmail };
