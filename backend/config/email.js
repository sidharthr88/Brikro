const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER.trim(),
        pass: process.env.EMAIL_PASS.trim()
    }
});

const sendEmail = async (to, subject, html) => {
    await transporter.sendMail({
        from: `"BRIKRO" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    });
};

module.exports = sendEmail;