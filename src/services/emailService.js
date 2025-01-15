// src/services/emailService.js
export const sendEmailToParent = async ({ to, subject, html, approvalLink }) => {
    try {
        // שימוש בשירות שליחת מיילים כמו SendGrid או Nodemailer
        // כאן תוכל להוסיף את ההגדרות והקוד לשליחת מיילים
        console.log('Sending email to:', to);
        console.log('Subject:', subject);
        console.log('HTML:', html);
        console.log('Approval Link:', approvalLink);

        // דוגמה לשליחת מייל עם nodemailer (יש להתקין את החבילה עם `npm install nodemailer`)
        /*
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'your-email@gmail.com',
                pass: 'your-email-password'
            }
        });

        const mailOptions = {
            from: 'your-email@gmail.com',
            to,
            subject,
            html: `${html}<br><br><a href="${approvalLink}">לחץ כאן לאישור</a>`
        };

        await transporter.sendMail(mailOptions);
        */

        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
