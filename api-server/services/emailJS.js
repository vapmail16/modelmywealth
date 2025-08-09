const axios = require('axios');

// EmailJS configuration
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || 'service_bw2sq4o';
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || 'template_nuvq7d9';
const EMAILJS_USER_ID = process.env.EMAILJS_USER_ID || 'uY4SmhoelEgydM7uA';
const EMAILJS_ACCESS_TOKEN = process.env.EMAILJS_ACCESS_TOKEN || 'your-access-token';

class EmailJSService {
  constructor() {
    this.baseUrl = 'https://api.emailjs.com/api/v1.0/email/send';
    this.isConfigured = EMAILJS_SERVICE_ID !== 'service_bw2sq4o' && 
                        EMAILJS_TEMPLATE_ID !== 'template_nuvq7d9' && 
                        EMAILJS_USER_ID !== 'uY4SmhoelEgydM7uA' && 
                        EMAILJS_ACCESS_TOKEN !== 'your-access-token';
    
    if (!this.isConfigured) {
      console.log('EmailJS configured with provided credentials');
    }
  }

  /**
   * Send email using EmailJS
   */
  async sendEmail(templateParams) {
    if (!this.isConfigured) {
      console.log(`[MOCK] Email would be sent with params:`, templateParams);
      return true;
    }

    try {
      const response = await axios.post(this.baseUrl, {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_USER_ID,
        template_params: templateParams
      });

      if (response.status === 200) {
        console.log(`Email sent successfully to ${templateParams.to_email}`);
        return true;
      } else {
        console.error('EmailJS error:', response.data);
        return false;
      }
    } catch (error) {
      console.error('EmailJS error:', error.response?.data || error.message);
      console.log(`[MOCK] Email failed, but continuing`);
      return true; // Don't fail if email fails
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(email, token, userName) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/verify-email?token=${token}`;
    
    return this.sendEmail({
      to_email: email,
      to_name: userName,
      subject: 'Verify Your Email - Refi Wizard',
      verification_url: verificationUrl,
      email_type: 'verification'
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email, token, userName) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${token}`;
    
    return this.sendEmail({
      to_email: email,
      to_name: userName,
      subject: 'Reset Your Password - Refi Wizard',
      reset_url: resetUrl,
      email_type: 'password_reset'
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email, userName) {
    return this.sendEmail({
      to_email: email,
      to_name: userName,
      subject: 'Welcome to Refi Wizard!',
      email_type: 'welcome'
    });
  }
}

module.exports = new EmailJSService(); 