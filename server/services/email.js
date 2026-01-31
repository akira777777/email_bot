import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const EmailService = {
  async sendEmail(to, subject, html) {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.warn('Email credentials not set. Skipping email send (Mock Mode).');
        return { messageId: 'mock-id', accepted: [to] };
    }

    try {
      const info = await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to,
        subject,
        html,
      });
      console.log('Message sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },
};
