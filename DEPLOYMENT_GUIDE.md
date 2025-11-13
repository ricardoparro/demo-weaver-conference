# Deployment Guide - Notebook Application

## Overview

This application consists of two parts:
1. **Frontend**: React application (can be deployed on Vercel)
2. **Backend**: Node.js/Express API with SQLite database (needs separate deployment)

## Current Issue & Solution

The application is not loading notes on Vercel because the backend API is not deployed. The frontend is trying to access the API endpoints but there's no backend server running on Vercel.

## Deployment Options

### Option 1: Deploy Backend Separately (Recommended)

#### Step 1: Deploy Backend
Choose one of these platforms for your backend:

**A. Railway.app (Easiest)**
1. Go to [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Select the `/backend` directory
4. Railway will auto-detect Node.js and deploy
5. Get your backend URL (e.g., `https://your-app.railway.app`)

**B. Render.com**
1. Go to [Render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set root directory to `backend`
5. Build command: `npm install`
6. Start command: `node server.js`
7. Get your backend URL (e.g., `https://your-app.onrender.com`)

**C. Heroku**
1. Install Heroku CLI
2. In the backend directory:
```bash
cd backend
heroku create your-app-name
git subtree push --prefix backend heroku main
```
3. Get your backend URL (e.g., `https://your-app.herokuapp.com`)

#### Step 2: Configure Vercel Frontend
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following variable:
   - Name: `VITE_API_URL`
   - Value: `https://your-backend-url.com/api` (your deployed backend URL)
4. Redeploy your frontend

### Option 2: Serverless Backend on Vercel

Convert the backend to Vercel Functions (requires code changes):

1. Create `api` directory in project root
2. Convert each endpoint to a serverless function
3. Use Vercel KV or PostgreSQL instead of SQLite

**Note**: This requires significant refactoring and is not recommended for quick deployment.

## Quick Fix Steps

### For Local Development
```bash
# Terminal 1: Start backend
cd backend
npm install
npm start
# Backend runs on http://localhost:8000

# Terminal 2: Start frontend
cd ..
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### For Production (Vercel)

1. **Deploy Backend First** (using Option 1 above)
2. **Configure Vercel Environment Variable**:
   - Go to: https://vercel.com/[your-username]/[your-project]/settings/environment-variables
   - Add: `VITE_API_URL` = `https://[your-backend-url]/api`
3. **Redeploy on Vercel**:
   - Trigger a new deployment or push a commit

## Environment Variables

### Frontend (.env for local development)
```env
# Not needed for local development (uses proxy)
# VITE_API_URL=http://localhost:8000/api
```

### Frontend (Vercel Production)
```env
VITE_API_URL=https://your-backend-deployment.com/api
```

### Backend Environment Variables
```env
PORT=8000
NODE_ENV=production
# Add CORS origin for your Vercel frontend
FRONTEND_URL=https://your-app.vercel.app
```

## Updated CORS Configuration

Make sure your backend `server.js` allows your Vercel domain:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

## Testing the Deployment

1. **Check Backend Health**:
   ```bash
   curl https://your-backend-url.com/api/health
   ```

2. **Check Frontend API Connection**:
   - Open browser console on your Vercel site
   - Check for API errors
   - Verify the API URL in Network tab

## Common Issues

### "Failed to load notebooks"
- Backend is not deployed or not running
- Wrong API URL in environment variables
- CORS not configured properly

### "Network Error" or CORS errors
- Backend CORS configuration needs to allow your Vercel domain
- Add your Vercel URL to backend CORS whitelist

### Database Issues
- SQLite file might not persist on some platforms
- Consider using PostgreSQL for production

## Recommended Production Setup

1. **Frontend**: Vercel (already set up)
2. **Backend**: Railway.app or Render.com
3. **Database**: PostgreSQL (instead of SQLite for production)

## Support

If you continue to have issues:
1. Check backend logs on your deployment platform
2. Verify environment variables are set correctly
3. Test API endpoints directly with curl or Postman
4. Check browser console for specific error messages

## Next Steps

1. Choose a backend deployment platform from Option 1
2. Deploy your backend
3. Add the `VITE_API_URL` environment variable to Vercel
4. Redeploy your Vercel frontend
5. Your application should now work with full backend functionality!