import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'yadshoodhotel@gmail.com',
        pass: process.env.SMTP_PASS || '',
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #B8860B;">The Yads Hood Hotel</h2>
        <p>You requested a password reset.</p>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 32px; background: #B8860B; color: #fff; text-decoration: none; border-radius: 8px; margin: 16px 0;">Reset Password</a>
        <p style="color: #666; font-size: 12px;">If you did not request this, ignore this email.</p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"The Yads Hood Hotel" <${process.env.SMTP_USER || 'yadshoodhotel@gmail.com'}>`,
        to,
        subject: 'Password Reset - The Yads Hood Hotel',
        html,
      });
    } catch (err: any) {
      console.log(`[MAIL] Password reset link for ${to}: ${resetUrl}`);
      console.log(`[MAIL] To send real emails, configure SMTP_PASS in .env`);
    }
  }

  async sendWelcomeEmail(to: string, password: string) {
    try {
      await this.transporter.sendMail({
        from: `"The Yads Hood Hotel" <${process.env.SMTP_USER || 'yadshoodhotel@gmail.com'}>`,
        to,
        subject: 'Welcome - The Yads Hood Hotel',
        html: `<p>Your account has been created.</p><p>Email: ${to}<br/>Password: ${password}</p>`,
      });
    } catch {
      console.log(`[MAIL] Welcome email for ${to} (password: ${password})`);
    }
  }
}
