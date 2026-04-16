const nodemailer = require("nodemailer");

async function send_otp(email, otp) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"MyApp" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Your OTP Code",
            html: `
                <h2>Your OTP: <strong>${otp}</strong></h2>
                <p>Expires in 10 minutes. Do not share it.</p>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.messageId);
        return { success: true };

    } catch (err) {
        console.error("Error:", err.message);
        return { success: false, error: err.message };
    }
}

module.exports.send_otp = send_otp;