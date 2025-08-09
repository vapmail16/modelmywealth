const nodemailer = require('nodemailer');

// Email configuration
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = process.env.EMAIL_PORT || 587;
const EMAIL_USER = process.env.EMAIL_USER || 'your-email@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'your-app-password';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@refiwizard.com';

class EmailService {
  constructor() {
    // Only create transporter if email credentials are properly configured
    if (EMAIL_USER !== 'your-email@gmail.com' && EMAIL_PASS !== 'your-app-password') {
      this.transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      });
    } else {
      console.log('Email service not configured - using mock mode');
      this.transporter = null;
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(email, token, userName) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email - Refi Wizard',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Refi Wizard!</h2>
          <p>Hi ${userName},</p>
          <p>Thank you for registering with Refi Wizard. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <br>
          <p>Best regards,<br>The Refi Wizard Team</p>
        </div>
      `
    };

    try {
      if (this.transporter) {
        await this.transporter.sendMail(mailOptions);
        console.log(`Email verification sent to ${email}`);
      } else {
        console.log(`[MOCK] Email verification would be sent to ${email}`);
        console.log(`[MOCK] Verification URL: ${verificationUrl}`);
      }
      return true;
    } catch (error) {
      console.error('Email verification error:', error);
      console.log(`[MOCK] Email verification failed, but continuing with registration`);
      return true; // Don't fail registration if email fails
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email, token, userName) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: EMAIL_FROM,
      to: email,
      subject: 'Reset Your Password - Refi Wizard',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Password Reset Request</h2>
          <p>Hi ${userName},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <br>
          <p>Best regards,<br>The Refi Wizard Team</p>
        </div>
      `
    };

    try {
      if (this.transporter) {
        await this.transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${email}`);
      } else {
        console.log(`[MOCK] Password reset email would be sent to ${email}`);
        console.log(`[MOCK] Reset URL: ${resetUrl}`);
      }
      return true;
    } catch (error) {
      console.error('Password reset email error:', error);
      console.log(`[MOCK] Password reset email failed, but continuing`);
      return true; // Don't fail if email fails
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email, userName) {
    const mailOptions = {
      from: EMAIL_FROM,
      to: email,
      subject: 'Welcome to Refi Wizard!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Welcome to Refi Wizard!</h2>
          <p>Hi ${userName},</p>
          <p>Thank you for verifying your email address. Your account is now active and ready to use!</p>
          <p>You can now:</p>
          <ul>
            <li>Create and manage your financial projects</li>
            <li>Perform debt restructuring calculations</li>
            <li>Generate detailed financial reports</li>
            <li>Export your data for further analysis</li>
          </ul>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <br>
          <p>Best regards,<br>The Refi Wizard Team</p>
        </div>
      `
    };

    try {
      if (this.transporter) {
        await this.transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${email}`);
      } else {
        console.log(`[MOCK] Welcome email would be sent to ${email}`);
      }
      return true;
    } catch (error) {
      console.error('Welcome email error:', error);
      console.log(`[MOCK] Welcome email failed, but continuing`);
      return true; // Don't fail if email fails
    }
  }
}

module.exports = new EmailService(); 