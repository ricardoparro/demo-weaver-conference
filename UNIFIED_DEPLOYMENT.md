# Unified Vercel Deployment Guide

## Overview

The application is now configured for **unified deployment on Vercel** with both frontend and backend deployed together as a single application. The backend API runs as Vercel Serverless Functions.

## Architecture

```
vercel.app/
├── Frontend (React)     → Static files
└── Backend (API)        → /api/* Serverless Functions
```

## What Changed

1. **Backend converted to Vercel Functions** (`/api` directory)
   - Each Express endpoint is now a serverless function
   - Database uses in-memory storage (resets on redeploy)
   - All 15 API endpoints implemented

2. **Frontend simplified**
   - No environment variables needed
   - API calls go to same domain `/api/*`
   - Works automatically in both dev and production

3. **Single deployment**
   - Deploy everything with one push
   - No separate backend hosting needed
   - Automatic HTTPS and scaling

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. **No configuration needed!** Just click "Deploy"
5. Wait for deployment (~1-2 minutes)
6. Your app is live! 🎉

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts, accept all defaults
```

## File Structure

```
conference/
├── api/                    # Vercel Functions (Backend)
│   ├── db.js              # In-memory database
│   ├── health.js          # GET /api/health
│   ├── notebooks/
│   │   ├── index.js       # GET, POST /api/notebooks
│   │   └── [id].js        # GET, PUT, DELETE /api/notebooks/:id
│   ├── notes/
│   │   ├── index.js       # GET, POST /api/notes
│   │   ├── [id].js        # GET, PUT, DELETE /api/notes/:id
│   │   └── [id]/
│   │       └── move.js    # POST /api/notes/:id/move
│   ├── search.js          # GET /api/search
│   ├── tags.js            # GET /api/tags
│   ├── favorites.js       # GET /api/favorites
│   └── trash/
│       ├── index.js       # GET /api/trash
│       └── [id]/
│           └── restore.js # POST /api/trash/:id/restore
├── src/                   # React Frontend
├── vercel.json           # Vercel configuration
└── package.json          # Dependencies
```

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Frontend runs on http://localhost:5173
# API proxy forwards to http://localhost:8000
```

For local API development with the Vercel Functions:
```bash
# Install Vercel CLI
npm i -g vercel

# Run local development with functions
vercel dev
```

## API Endpoints

All endpoints are available at `/api/*`:

- `GET /api/health` - Health check
- `GET /api/notebooks` - List notebooks
- `POST /api/notebooks` - Create notebook
- `GET /api/notebooks/:id` - Get notebook
- `PUT /api/notebooks/:id` - Update notebook
- `DELETE /api/notebooks/:id` - Delete notebook
- `GET /api/notes` - List notes
- `POST /api/notes` - Create note
- `GET /api/notes/:id` - Get note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note (soft)
- `POST /api/notes/:id/move` - Move note
- `GET /api/search?q=query` - Search notes
- `GET /api/tags` - List tags
- `GET /api/favorites` - List favorites
- `GET /api/trash` - List trash
- `POST /api/trash/:id/restore` - Restore from trash

## Database Limitations

**Important:** The current implementation uses **in-memory storage** which:
- ✅ Works perfectly for demos and testing
- ✅ No setup required
- ❌ Data resets when the function cold starts
- ❌ Not suitable for production

### Production Database Options

For persistent data, upgrade to:

1. **Vercel KV** (Redis)
   ```javascript
   import { kv } from '@vercel/kv';
   await kv.set('key', 'value');
   ```

2. **Vercel Postgres**
   ```javascript
   import { sql } from '@vercel/postgres';
   await sql`SELECT * FROM notes`;
   ```

3. **External Database**
   - Supabase
   - PlanetScale
   - MongoDB Atlas
   - Firebase

## Environment Variables

No environment variables needed! The app works out of the box.

## Monitoring

View function logs in Vercel Dashboard:
1. Go to your project
2. Click "Functions" tab
3. View logs for each endpoint

## Performance

- Functions have 10-second timeout
- First request may be slower (cold start)
- Subsequent requests are fast
- Automatic scaling

## Troubleshooting

### "Data disappeared after deployment"
- Expected behavior with in-memory storage
- Upgrade to persistent database for production

### "API calls failing"
- Check function logs in Vercel Dashboard
- Verify API routes match `/api/*` pattern

### "Slow initial load"
- Normal cold start behavior
- Consider using Edge Functions for faster starts

## Cost

- **Hobby Plan (Free)**
  - 100GB bandwidth
  - Serverless Function Execution: 100GB-Hrs
  - Perfect for this demo

- **Pro Plan ($20/month)**
  - More resources
  - Team collaboration
  - Analytics

## Next Steps

1. **Deploy to Vercel** ✓
2. **Test all features** ✓
3. **For production:**
   - Add persistent database
   - Add authentication
   - Add rate limiting
   - Enable analytics

## Summary

Your notebook app is now:
- ✅ Fully integrated (frontend + backend)
- ✅ Deployed on single platform
- ✅ Automatically scaled
- ✅ HTTPS enabled
- ✅ Globally distributed
- ✅ Zero configuration needed

Just push to GitHub and Vercel handles everything! 🚀