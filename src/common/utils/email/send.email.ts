
import nodemailer from 'nodemailer';

export async function sendEmail({
    from = process.env.APP_EMAIL,
   
    to = '',
    cc = '',
    bcc = '',
    subject = 'Social Media app',
    html = '',
    text = '',
    attachments
}: {
    from?: string,
    to?: string,
    cc?: string,
    bcc?: string,
    subject?: string,
    html?: string,
    text?: string,
    attachments?: any
} = {}) {
        const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user:'ayalabib57@gmail.com',
            pass: process.env.APP_PASSWORD,
        }
        })
    
    

        const info = await transporter.sendMail({
            from: `"Nest App" <${from}>`,
            to, cc, bcc,text,
            subject,
            html,
            attachments
});
    console.log(`📧 Email sent to ${to} `, info.messageId);
}