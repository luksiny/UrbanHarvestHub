# Deployment Guide

This guide will help you deploy the Urban Harvest Hub full-stack PWA to production.

## Prerequisites

1. MongoDB Atlas account (free tier available)
2. Render/Railway account for backend
3. Netlify/Vercel account for frontend
4. GitHub repository

## Step 1: MongoDB Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for all IPs - not recommended for production)
5. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/urbanharvesthub`

## Step 2: Backend Deployment (Render)

1. Go to [Render](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: urban-harvest-hub-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: (leave empty)
5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `PORT`: (auto-set by Render)
6. Click "Create Web Service"
7. Wait for deployment to complete
8. Copy your service URL (e.g., `https://urban-harvest-hub-api.onrender.com`)

### Alternative: Railway Deployment

1. Go to [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NODE_ENV`: `production`
5. Railway will auto-detect Node.js and deploy

## Step 3: Frontend Deployment (Netlify)

1. Go to [Netlify](https://netlify.com) and sign in
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`
5. Add Environment Variables:
   - `REACT_APP_API_URL`: Your backend URL (e.g., `https://urban-harvest-hub-api.onrender.com/api`)
6. Click "Deploy site"
7. Wait for deployment
8. Your site will be live at `https://your-site.netlify.app`

### Alternative: Vercel Deployment

1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Add Environment Variable:
   - `REACT_APP_API_URL`: Your backend URL
6. Click "Deploy"

## Step 4: Seed Database

After deployment, seed your database with initial data:

1. SSH into your backend server or run locally with production MongoDB URI:
```bash
MONGODB_URI=your_production_mongodb_uri npm run seed
```

Or use Render's shell:
1. Go to your Render service
2. Click "Shell" tab
3. Run: `MONGODB_URI=your_uri npm run seed`

## Step 5: Update CORS Settings

If your frontend and backend are on different domains, update CORS in `backend/index.js`:

```javascript
app.use(cors({
  origin: ['https://your-frontend.netlify.app', 'https://your-frontend.vercel.app'],
  credentials: true
}));
```

## Step 6: Verify Deployment

1. **Backend Health Check**: Visit `https://your-api.onrender.com/api/health`
2. **Frontend**: Visit your Netlify/Vercel URL
3. **PWA Installation**: 
   - On mobile: Open site → Add to Home Screen
   - On desktop: Look for install icon in browser
4. **Offline Mode**: Disconnect internet and verify app still loads
5. **Lighthouse Test**: Run Lighthouse audit (target: 90+ PWA score)

## Troubleshooting

### Backend Issues

- **MongoDB Connection Error**: Check your connection string and IP whitelist
- **Port Error**: Ensure `PORT` env var is set (Render sets this automatically)
- **Build Fails**: Check Node version (should be 18+)

### Frontend Issues

- **API Calls Fail**: Check `REACT_APP_API_URL` environment variable
- **CORS Errors**: Update CORS settings in backend
- **Service Worker Not Working**: Ensure HTTPS is enabled (required for service workers)

### PWA Issues

- **Not Installable**: Check manifest.json and ensure HTTPS
- **Offline Not Working**: Verify service worker is registered (check browser console)
- **Low Lighthouse Score**: Optimize images, enable compression, check bundle size

## Environment Variables Summary

### Backend (.env)
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/urbanharvesthub
PORT=5000
```

### Frontend (Netlify/Vercel)
```
REACT_APP_API_URL=https://your-api.onrender.com/api
```

## Security Notes

1. Never commit `.env` files
2. Use environment variables for all secrets
3. Enable HTTPS (automatic on Render/Netlify/Vercel)
4. Restrict MongoDB IP whitelist in production
5. Use strong database passwords
6. Enable rate limiting in production (consider adding express-rate-limit)

## Monitoring

- **Render**: Built-in logs and metrics
- **Netlify**: Analytics and logs available
- **MongoDB Atlas**: Database monitoring dashboard

## Updates

To update your deployment:
1. Push changes to GitHub
2. Render/Netlify will auto-deploy
3. For manual deployments, trigger from dashboard
