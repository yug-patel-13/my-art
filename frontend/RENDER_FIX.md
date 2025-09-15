# Render Deployment Fix

## Issue Fixed
- Frontend build failing due to `react-scripts: not found`
- Updated render.yaml configuration
- Fixed build commands

## Steps to Deploy

### 1. Frontend Deployment
1. Go to Render Dashboard
2. Create new "Static Site"
3. Connect to your GitHub repository
4. Use these settings:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Root Directory**: Leave empty (uses root)
   - **Environment Variables**:
     - `REACT_APP_API_URL` = `https://your-backend-url.onrender.com`

### 2. Backend Deployment
1. Create new "Web Service"
2. Connect to your GitHub repository
3. Use these settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: (Set in Render dashboard)

### 3. Database
1. Create PostgreSQL database in Render
2. Copy connection details to backend environment variables

## Environment Variables for Backend
```
NODE_ENV=production
PORT=10000
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=art_gallery
DB_USER=postgres
DB_PASSWORD=your-db-password
JWT_SECRET=your-secret-key
EMAIL_USER=yug.patel.sings01@gmail.com
EMAIL_PASS=xrxnqefrvnvmzocp
ADMIN_EMAIL=yug.patel.sings01@gmail.com
CORS_ORIGIN=https://your-frontend-url.onrender.com
FRONTEND_URL=https://your-frontend-url.onrender.com
```

## Troubleshooting
- Make sure all dependencies are in package.json
- Check that build commands are correct
- Verify environment variables are set
- Ensure database is accessible from backend
