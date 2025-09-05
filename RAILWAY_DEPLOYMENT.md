# 🚀 Railway Free Hosting Deployment Guide

## **Why Railway?**
- ✅ **100% Free** for small projects
- ✅ **Automatic Deployments** from GitHub
- ✅ **Built-in PostgreSQL** database
- ✅ **Custom Domains** support
- ✅ **Easy Environment Variables**
- ✅ **No Credit Card Required**

---

## **📋 Step-by-Step Deployment**

### **Step 1: Prepare Your Repository**

1. **Create .env files locally (NEVER commit these):**
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

2. **Create GitHub Repository:**
   ```bash
   # In your art-gallery folder
   git init
   git add .
   git commit -m "Initial commit - Art Gallery"
   git branch -M main
   git remote add origin https://github.com/yourusername/art-gallery.git
   git push -u origin main
   ```

3. **Verify .gitignore is working:**
   ```bash
   git status
   # Should NOT show .env files, node_modules/, uploads/
   ```

### **Step 2: Deploy to Railway**

1. **Go to Railway:** https://railway.app
2. **Sign up with GitHub** (free)
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your art-gallery repository**
6. **Railway will automatically detect your project**

### **Step 3: Add PostgreSQL Database**

1. **In Railway dashboard, click "New"**
2. **Select "Database" → "PostgreSQL"**
3. **Railway will create a free PostgreSQL database**
4. **Copy the connection details**

### **Step 4: Set Environment Variables**

In Railway dashboard, go to your project → Variables tab:

```env
NODE_ENV=production
PORT=5000
DB_HOST=your-railway-db-host
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=your-railway-db-password
JWT_SECRET=your-super-secret-jwt-key-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=your-email@gmail.com
CORS_ORIGIN=https://your-app-name.railway.app
```

### **Step 5: Deploy Frontend**

1. **In Railway, click "New Service"**
2. **Select "GitHub Repo"**
3. **Choose your repository again**
4. **Set Root Directory to: `/`**
5. **Set Build Command: `npm run build`**
6. **Set Start Command: `npx serve -s build`**

### **Step 6: Custom Domain (Optional)**

1. **In Railway dashboard, go to Settings**
2. **Click "Domains"**
3. **Add your custom domain**
4. **Update CORS_ORIGIN in environment variables**

---

## **🎯 Railway Advantages**

- ✅ **Zero Configuration** - Works out of the box
- ✅ **Automatic HTTPS** - SSL certificates included
- ✅ **Global CDN** - Fast loading worldwide
- ✅ **Auto-scaling** - Handles traffic spikes
- ✅ **GitHub Integration** - Auto-deploy on push
- ✅ **Free PostgreSQL** - No database setup needed
- ✅ **Custom Domains** - Use your own domain name

---

## **💰 Railway Pricing**

- **Free Tier:** $5 credit monthly (enough for small apps)
- **Hobby Plan:** $5/month (if you exceed free tier)
- **No Credit Card Required** for free tier

---

## **🔧 Alternative: Vercel + Railway**

### **Frontend on Vercel (Free)**
1. **Go to:** https://vercel.com
2. **Import your GitHub repository**
3. **Set Build Command:** `npm run build`
4. **Set Output Directory:** `build`
5. **Deploy automatically**

### **Backend on Railway (Free)**
1. **Follow Railway steps above**
2. **Update CORS_ORIGIN to your Vercel URL**

---

## **🎉 You're Live!**

After deployment:
- ✅ **Frontend:** https://your-app.vercel.app
- ✅ **Backend:** https://your-api.railway.app
- ✅ **Database:** PostgreSQL on Railway
- ✅ **Email:** Working with your Gmail
- ✅ **Custom Domain:** Optional

**Your art gallery will be live and fully functional!** 🚀
