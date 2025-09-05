# 🚀 Netlify + Railway Hybrid Deployment Guide

## **Why This Combination?**
- ✅ **Netlify:** Best for React frontend (free)
- ✅ **Railway:** Best for Node.js backend (free)
- ✅ **Both 100% Free** for small projects
- ✅ **Excellent Performance** and reliability
- ✅ **Easy to set up** and maintain

---

## **📋 Step-by-Step Deployment**

### **Step 1: Prepare Your Repository**

1. **Create GitHub Repository:**
   ```bash
   # In your art-gallery folder
   git init
   git add .
   git commit -m "Initial commit - Art Gallery"
   git branch -M main
   git remote add origin https://github.com/yourusername/art-gallery.git
   git push -u origin main
   ```

### **Step 2: Deploy Backend to Railway**

1. **Go to Railway:** https://railway.app
2. **Sign up with GitHub** (free)
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your art-gallery repository**
6. **Set Root Directory to:** `backend`

### **Step 3: Add PostgreSQL Database on Railway**

1. **In Railway dashboard, click "New"**
2. **Select "Database" → "PostgreSQL"**
3. **Railway will create a free PostgreSQL database**
4. **Copy the connection details**

### **Step 4: Set Railway Environment Variables**

In Railway dashboard, go to your project → Variables:

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
CORS_ORIGIN=https://your-app.netlify.app
```

### **Step 5: Deploy Frontend to Netlify**

1. **Go to Netlify:** https://netlify.com
2. **Sign up with GitHub** (free)
3. **Click "New site from Git"**
4. **Choose GitHub and select your repository**
5. **Configure:**
   - **Build Command:** `npm run build`
   - **Publish Directory:** `build`
   - **Base Directory:** (leave empty)

### **Step 6: Update Frontend API URLs**

After Railway deploys, you'll get a backend URL like:
`https://your-backend.railway.app`

Update your frontend to use this URL:

1. **In Netlify dashboard, go to Site Settings**
2. **Click "Environment Variables"**
3. **Add:**
   ```
   REACT_APP_API_URL=https://your-backend.railway.app
   ```

### **Step 7: Update Frontend Code**

Update your frontend API calls to use the environment variable:

```javascript
// In your frontend components
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Use API_URL instead of hardcoded localhost
fetch(`${API_URL}/api/auth/login`, {
  // ... rest of your code
});
```

### **Step 8: Custom Domain (Optional)**

1. **In Netlify dashboard, go to Domain Settings**
2. **Add your custom domain**
3. **Update CORS_ORIGIN in Railway environment variables**

---

## **🎯 Advantages of This Setup**

- ✅ **Netlify:** Best-in-class frontend hosting
- ✅ **Railway:** Excellent Node.js backend hosting
- ✅ **Both Free:** No cost for small projects
- ✅ **Fast Performance:** Global CDN on both platforms
- ✅ **Easy Updates:** Auto-deploy on Git push
- ✅ **Custom Domains:** Use your own domain
- ✅ **SSL Certificates:** Automatic HTTPS

---

## **💰 Pricing**

- **Netlify:** 100GB bandwidth/month (free)
- **Railway:** $5 credit/month (free tier)
- **Total Cost:** $0 for small projects

---

## **🎉 You're Live!**

After deployment:
- ✅ **Frontend:** https://your-app.netlify.app
- ✅ **Backend:** https://your-api.railway.app
- ✅ **Database:** PostgreSQL on Railway
- ✅ **Email:** Working with your Gmail
- ✅ **Custom Domain:** Optional

**Your art gallery will be live and fully functional!** 🚀
