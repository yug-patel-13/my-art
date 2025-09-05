# 🚀 Deploy Your Art Gallery NOW!

## **🎯 Quick 5-Minute Deployment**

### **Step 1: Go to Railway**
1. **Open:** https://railway.app
2. **Click "Sign up with GitHub"**
3. **Authorize Railway to access your repositories**

### **Step 2: Deploy Backend**
1. **Click "New Project"**
2. **Select "Deploy from GitHub repo"**
3. **Choose:** `yug-patel-13/my-art`
4. **Set Root Directory:** `backend`
5. **Railway will auto-detect Node.js and deploy**

### **Step 3: Add Database**
1. **Click "New" → "Database" → "PostgreSQL"**
2. **Railway creates free PostgreSQL database**
3. **Copy the connection details**

### **Step 4: Set Environment Variables**
In your backend service → **Variables** tab, add:

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
CORS_ORIGIN=https://your-frontend.railway.app
FRONTEND_URL=https://your-frontend.railway.app
```

**Replace the database values with your actual Railway database credentials!**

### **Step 5: Deploy Frontend**
1. **Click "New Service"**
2. **Select "GitHub Repo"**
3. **Choose:** `yug-patel-13/my-art`
4. **Set Root Directory:** `/` (empty)
5. **Set Build Command:** `npm run build`
6. **Set Start Command:** `npx serve -s build`

### **Step 6: Update Frontend Environment**
In your frontend service → **Variables** tab:

```env
REACT_APP_API_URL=https://your-backend.railway.app
```

### **Step 7: Test Your Website**
1. **Wait for both services to deploy**
2. **Visit your frontend URL**
3. **Test all features:**
   - ✅ User registration/login
   - ✅ Browse artworks
   - ✅ Add to cart
   - ✅ Buy now
   - ✅ Custom art forms
   - ✅ Order placement

---

## **🎉 You're Live!**

**Your art gallery is now hosted for FREE with:**
- 🌐 **Professional URLs**
- 🗄️ **Free PostgreSQL Database**
- 📧 **Email Notifications**
- 🔐 **Secure Authentication**
- 🛒 **Complete E-commerce**
- 📱 **Responsive Design**

---

## **🔧 If You Need Help:**

### **Database Migration (Optional):**
If you want to migrate your local data:
```bash
cd backend
node migrate-to-railway.js
```

### **Alternative Hosting:**
- **Render:** https://render.com (also free)
- **Vercel + Railway:** Frontend on Vercel, Backend on Railway
- **Netlify + Railway:** Frontend on Netlify, Backend on Railway

---

## **💰 Cost: $0**

**Everything is completely FREE!**
- ✅ Railway hosting: Free
- ✅ PostgreSQL database: Free
- ✅ Custom domains: Free
- ✅ SSL certificates: Free
- ✅ Auto-deployments: Free

**Start deploying now!** 🚀
