# Environment Variables Setup Guide

## 🔒 IMPORTANT: Never commit .env files to GitHub!

Your `.env` files contain sensitive information and should NEVER be uploaded to GitHub.

## 📋 How to Set Up Environment Variables

### For Local Development:

1. **Create `.env` file** in `art-gallery/backend/` directory
2. **Copy this template** and fill in your actual values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=art_gallery
DB_USER=postgres
DB_PASSWORD=your_actual_postgres_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Email Configuration (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=your-email@gmail.com
```

### For Render Deployment:

Set these environment variables in your Render dashboard:

#### Backend Service Environment Variables:
```
NODE_ENV=production
PORT=10000
DB_HOST=your-render-database-host
DB_PORT=5432
DB_NAME=art_gallery
DB_USER=postgres
DB_PASSWORD=your-render-database-password
JWT_SECRET=your-super-secret-jwt-key-here
EMAIL_USER=yug.patel.sings01@gmail.com
EMAIL_PASS=xrxnqefrvnvmzocp
ADMIN_EMAIL=yug.patel.sings01@gmail.com
CORS_ORIGIN=https://my-art.onrender.com
FRONTEND_URL=https://my-art.onrender.com
```

#### Frontend Service Environment Variables:
```
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

## 🛡️ Security Notes:

- ✅ `.env` files are already in `.gitignore`
- ✅ Never share your actual passwords
- ✅ Use strong, unique JWT secrets
- ✅ Keep your database credentials secure
- ✅ Use different passwords for different environments

## 🚀 Quick Setup:

1. **Local**: Create `.env` file with your local database credentials
2. **Render**: Set environment variables in Render dashboard
3. **Test**: Verify everything works locally first
4. **Deploy**: Push to GitHub and deploy on Render
