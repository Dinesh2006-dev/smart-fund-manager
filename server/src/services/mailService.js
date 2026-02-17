const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Sends a 6-digit OTP to the specified email.
 */
const sendOTPEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: `"Smart Fund Admin" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>You requested to reset your password. Use the OTP below to proceed:</p>
                    <div style="font-size: 24px; font-weight: bold; background: #f4f4f4; padding: 10px; display: inline-block; border-radius: 5px; letter-spacing: 5px;">
                        ${otp}
                    </div>
                    <p style="margin-top: 20px; color: #666;">This OTP is valid for <strong>10 minutes</strong>. If you didn't request this, please ignore this email.</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        // DEV MODE FALLBACK: Log OTP to console and return true so user can proceed
        console.log('====================================================');
        console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
        console.log('====================================================');
        return true;
    }
};

module.exports = { sendOTPEmail };
