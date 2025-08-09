# 📧 EmailJS Setup Guide for Production

## **Step 1: EmailJS Account Setup**

1. **Sign up at [EmailJS.com](https://www.emailjs.com/)**
2. **Create a new Email Service:**
   - Go to Email Services → Add New Service
   - Choose your email provider (Gmail, Outlook, etc.)
   - Configure SMTP settings
   - Note down your **Service ID**

3. **Create Email Templates:**
   - Go to Email Templates → Create New Template
   - Create templates for:
     - **Email Verification**
     - **Password Reset** 
     - **Welcome Email**

## **Step 2: Template Variables**

### **Email Verification Template:**
```html
Subject: Verify Your Email - Refi Wizard

Hi {{to_name}},

Thank you for registering with Refi Wizard. Please verify your email address by clicking the button below:

<a href="{{verification_url}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
  Verify Email Address
</a>

If the button doesn't work, copy and paste this link: {{verification_url}}

This link will expire in 24 hours.

Best regards,
The Refi Wizard Team
```

### **Password Reset Template:**
```html
Subject: Reset Your Password - Refi Wizard

Hi {{to_name}},

We received a request to reset your password. Click the button below to create a new password:

<a href="{{reset_url}}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
  Reset Password
</a>

If the button doesn't work, copy and paste this link: {{reset_url}}

This link will expire in 1 hour.

Best regards,
The Refi Wizard Team
```

### **Welcome Email Template:**
```html
Subject: Welcome to Refi Wizard!

Hi {{to_name}},

Thank you for verifying your email address. Your account is now active and ready to use!

You can now:
• Create and manage your financial projects
• Perform debt restructuring calculations
• Generate detailed financial reports
• Export your data for further analysis

If you have any questions, feel free to reach out to our support team.

Best regards,
The Refi Wizard Team
```

## **Step 3: Environment Variables**

Add these to your `.env` file:

```bash
# EmailJS Configuration
EMAILJS_SERVICE_ID=your_service_id_here
EMAILJS_TEMPLATE_ID=your_template_id_here
EMAILJS_USER_ID=your_user_id_here
EMAILJS_ACCESS_TOKEN=your_access_token_here

# Frontend URL (for email links)
FRONTEND_URL=https://yourdomain.com
```

## **Step 4: Get Your Credentials**

1. **Service ID:** Found in Email Services section
2. **Template ID:** Found in Email Templates section  
3. **User ID:** Found in Account → API Keys
4. **Access Token:** Generate in Account → API Keys

## **Step 5: Test Configuration**

After setting up, test with:

```bash
# Test registration (should send verification email)
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "securepass123", "full_name": "Test User", "user_type": "business"}'

# Test forgot password (should send reset email)
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## **Step 6: Production Deployment**

1. **Set environment variables** in your production environment
2. **Update FRONTEND_URL** to your production domain
3. **Test all email flows** in production
4. **Monitor email delivery** in EmailJS dashboard

## **Troubleshooting**

### **Common Issues:**

1. **"EmailJS not configured"**
   - Check all environment variables are set
   - Verify no default values remain

2. **"Email failed to send"**
   - Check EmailJS dashboard for errors
   - Verify template variables match code
   - Check API rate limits

3. **"Template not found"**
   - Verify Template ID is correct
   - Check template is published

### **Testing in Development:**

The system will use mock mode if EmailJS is not configured, so you can develop without setting up EmailJS immediately.

## **Security Notes**

- ✅ **Access tokens** are stored securely in environment variables
- ✅ **Email templates** are validated server-side
- ✅ **Rate limiting** prevents email spam
- ✅ **Token expiration** ensures security
- ✅ **HTTPS links** for production emails

## **Cost Considerations**

- EmailJS offers **200 emails/month free**
- **Paid plans** start at $15/month for 1,000 emails
- **Enterprise plans** available for high volume

## **Alternative Setup**

If you prefer to use the original nodemailer setup:

1. Set these environment variables instead:
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@refiwizard.com
```

2. Change the import in `server.js`:
```javascript
const emailService = require("./services/emailService"); // Instead of emailJS
```

Both systems will work seamlessly with the same API endpoints! 