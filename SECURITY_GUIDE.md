# 🔒 Security Guide for Art Gallery

## **✅ What's Protected by .gitignore**

### **🚫 NEVER Committed to Git:**
- ✅ `.env` files (contains passwords, API keys)
- ✅ `node_modules/` (dependencies)
- ✅ `uploads/` (user uploaded photos)
- ✅ `*.log` files (logs)
- ✅ `.DS_Store` (system files)
- ✅ Test files and temporary files

### **✅ Safe to Commit:**
- ✅ `env.example` (template files)
- ✅ Source code
- ✅ Configuration files
- ✅ Documentation

---

## **🔐 Environment Variables Security**

### **Backend (.env):**
```env
# NEVER commit these values to git!
NODE_ENV=production
PORT=5000
DB_HOST=your-railway-db-host
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=your-railway-db-password  # SECRET!
JWT_SECRET=your-super-secret-jwt-key  # SECRET!
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password          # SECRET!
ADMIN_EMAIL=your-email@gmail.com
CORS_ORIGIN=https://your-app.railway.app
```

### **Frontend (.env):**
```env
# NEVER commit these values to git!
REACT_APP_API_URL=https://your-backend.railway.app
```

---

## **🚀 Railway Deployment Security**

### **Step 1: Create .env Files Locally**
```bash
# Backend
cd backend
cp env.example .env
# Edit .env with your actual values

# Frontend
cd ..
cp env.example .env
# Edit .env with your actual values
```

### **Step 2: Set Railway Environment Variables**
In Railway dashboard, go to Variables tab and add:

```env
NODE_ENV=production
DB_HOST=your-railway-db-host
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=your-railway-db-password
JWT_SECRET=your-super-secret-jwt-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=your-email@gmail.com
CORS_ORIGIN=https://your-app.railway.app
```

### **Step 3: Verify .gitignore is Working**
```bash
# Check what will be committed
git status

# Should NOT show:
# - .env files
# - node_modules/
# - uploads/ (except .gitkeep)
# - *.log files
```

---

## **🔒 Security Best Practices**

### **✅ DO:**
- ✅ Use strong, unique passwords
- ✅ Generate random JWT secrets
- ✅ Use App Passwords for Gmail
- ✅ Set CORS_ORIGIN to your actual domain
- ✅ Use HTTPS in production
- ✅ Keep dependencies updated

### **❌ DON'T:**
- ❌ Commit .env files to git
- ❌ Use weak passwords
- ❌ Share API keys publicly
- ❌ Use default JWT secrets
- ❌ Allow CORS from any origin in production

---

## **🎯 Railway-Specific Security**

### **Environment Variables in Railway:**
1. **Go to your Railway project**
2. **Click "Variables" tab**
3. **Add each environment variable**
4. **Railway will use these instead of .env files**

### **Database Security:**
- ✅ Railway provides secure PostgreSQL
- ✅ Connection strings are encrypted
- ✅ Database is isolated per project

### **File Uploads:**
- ✅ Uploads are stored securely on Railway
- ✅ Files are not accessible via direct URLs
- ✅ Only your app can access uploaded files

---

## **🔍 Security Checklist**

Before deploying:

- [ ] `.env` files are in `.gitignore`
- [ ] `node_modules/` is in `.gitignore`
- [ ] `uploads/` is in `.gitignore`
- [ ] Strong JWT secret generated
- [ ] Strong database password
- [ ] Gmail App Password (not regular password)
- [ ] CORS_ORIGIN set to your domain
- [ ] All test files ignored
- [ ] No sensitive data in source code

---

## **🎉 You're Secure!**

Your art gallery is now properly secured:
- ✅ **No sensitive data** in git repository
- ✅ **Environment variables** protected
- ✅ **File uploads** secured
- ✅ **Database** protected
- ✅ **Email** configured securely

**Ready for safe deployment to Railway!** 🚀🔒
