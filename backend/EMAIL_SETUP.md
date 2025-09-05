# 📧 Email Setup Guide

## **How to Configure Email Notifications**

### **Step 1: Create .env File**
Create a `.env` file in the `backend` folder with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=art_gallery
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# CORS
CORS_ORIGIN=http://localhost:3000

# Email Configuration (UPDATE THESE WITH YOUR EMAIL DETAILS)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@artgallery.com
```

### **Step 2: Gmail Setup (Recommended)**

#### **For Gmail Users:**

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. **Update .env file:**
   ```env
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ADMIN_EMAIL=your-gmail@gmail.com
   ```

#### **For Other Email Providers:**

**Outlook/Hotmail:**
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
ADMIN_EMAIL=your-email@outlook.com
```

**Yahoo:**
```env
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=your-email@yahoo.com
```

### **Step 3: Test Email Configuration**

Run this command to test your email setup:

```bash
node test-email.js
```

### **Step 4: What Emails Will Be Sent**

#### **Custom Sketch Orders:**
- **To:** Your admin email
- **CC:** Customer's email
- **Subject:** 🎨 New Custom Sketch Order - [Customer Name]
- **Attachment:** Customer's uploaded reference photo
- **Content:** Customer details, size, number of persons, price

#### **Custom Painting Requests:**
- **To:** Your admin email
- **CC:** Customer's email
- **Subject:** 🎨 New Custom Painting Request - [Customer Name]
- **Content:** Customer details, phone, vision description

#### **Order Confirmations:**
- **To:** Customer's email
- **Subject:** 🎨 Order Confirmation - [Order Number]
- **Content:** Order details, items, total amount

### **Step 5: Email Features**

✅ **Photo Attachments** - Reference photos are attached to sketch order emails
✅ **Professional HTML Templates** - Beautiful, responsive email designs
✅ **Customer CC** - Customers receive copies of their order emails
✅ **Error Handling** - Orders still save even if email fails
✅ **Admin Notifications** - You get notified of all new orders

### **Step 6: Troubleshooting**

#### **Common Issues:**

1. **"Invalid login" error:**
   - Use App Password instead of regular password for Gmail
   - Enable 2-Factor Authentication first

2. **"Connection timeout" error:**
   - Check your internet connection
   - Verify email provider settings

3. **"Authentication failed" error:**
   - Double-check EMAIL_USER and EMAIL_PASS in .env
   - Make sure .env file is in the backend folder

#### **Test Commands:**

```bash
# Test email configuration
node test-email.js

# Test custom sketch email
node test-sketch-email.js

# Test custom painting email
node test-painting-email.js
```

### **Step 7: Production Setup**

For production deployment:

1. **Use a dedicated email service** like:
   - SendGrid
   - Mailgun
   - Amazon SES
   - Postmark

2. **Update email service configuration** in `services/emailService.js`

3. **Set environment variables** on your hosting platform

---

## **🎉 You're All Set!**

Once configured, every custom art order will automatically send you an email with:
- Customer details
- Order information
- **Uploaded reference photos** (for sketches)
- Professional email templates

**No more missing orders!** 📧✨
