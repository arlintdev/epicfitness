# Epic Fitness Platform - Deployment Guide

This guide will help you deploy the Epic Fitness Platform with a free PostgreSQL database and free hosting.

## Services Used
- **Frontend**: Cloudflare Pages or Netlify (free)
- **Backend**: Render.com (free tier)
- **Database**: Neon.tech (free PostgreSQL)

## Step 1: Set up PostgreSQL Database on Neon

1. Go to [Neon.tech](https://neon.tech) and sign up for a free account
2. Create a new project called "epicfitness"
3. Copy your database connection string (it looks like: `postgresql://username:password@host/database`)
4. Save this connection string - you'll need it for the backend deployment

## Step 2: Deploy Backend to Render

1. Push your code to GitHub if you haven't already:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git remote add origin https://github.com/YOUR_USERNAME/epicfitness.git
   git push -u origin main
   ```

2. Go to [Render.com](https://render.com) and sign up for a free account
3. Click "New +" and select "Web Service"
4. Connect your GitHub account and select your repository
5. Configure your service:
   - **Name**: epicfitness-backend
   - **Environment**: Node
   - **Build Command**: `npm install && npx prisma generate && npx prisma db push && npx tsx prisma/seed-simple.ts`
   - **Start Command**: `npm run start`
   - **Instance Type**: Free

6. Add Environment Variables:
   - `NODE_ENV`: production
   - `DATABASE_URL`: (paste your Neon connection string here)
   - `JWT_SECRET`: (click "Generate" for a random value)
   - `JWT_REFRESH_SECRET`: (click "Generate" for a random value)
   - `SESSION_SECRET`: (click "Generate" for a random value)
   - `FRONTEND_URL`: https://epicfitness.pages.dev (or your Netlify URL)
   - `PORT`: 10000
   - `API_VERSION`: v1
   - `RATE_LIMIT_WINDOW_MS`: 900000
   - `RATE_LIMIT_MAX_REQUESTS`: 1000

7. Click "Create Web Service" and wait for deployment

## Step 3: Deploy Frontend to Cloudflare Pages

### Option A: Using Cloudflare Pages (Recommended)

1. Build your frontend locally:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. Go to [Cloudflare Pages](https://pages.cloudflare.com)
3. Sign up/login and click "Create a project"
4. Choose "Connect to Git" and connect your GitHub repository
5. Configure your build:
   - **Project name**: epicfitness
   - **Production branch**: main
   - **Framework preset**: Create React App
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `frontend`

6. Add Environment Variable:
   - `VITE_API_URL`: https://epicfitness-backend.onrender.com/api/v1

7. Click "Save and Deploy"

### Option B: Using Netlify

1. Build your frontend:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. Go to [Netlify](https://app.netlify.com)
3. Drag and drop your `frontend/dist` folder to deploy
4. Go to Site Settings > Domain Management
5. Change site name to `epicfitness`
6. Add Environment Variable in Site Settings > Environment Variables:
   - `VITE_API_URL`: https://epicfitness-backend.onrender.com/api/v1

## Step 4: Update Backend CORS

Once your frontend is deployed, update the backend environment variable:
1. Go to your Render dashboard
2. Update the `FRONTEND_URL` to your actual frontend URL
3. The backend will automatically redeploy

## Step 5: Test Your Deployment

1. Visit your frontend URL
2. Register a new account
3. Test creating workouts, scheduling, etc.

## Important Notes

- The backend on Render free tier will spin down after 15 minutes of inactivity. First request after inactivity may take 30-60 seconds.
- Neon free tier provides 0.5 GB storage and automatically pauses after 5 minutes of inactivity
- For production use, consider upgrading to paid tiers for better performance

## Troubleshooting

### Backend not connecting to database
- Check that your DATABASE_URL is correct in Render environment variables
- Make sure there are no extra quotes or spaces

### CORS errors
- Verify FRONTEND_URL environment variable matches your deployed frontend URL
- Check that the backend has redeployed after updating environment variables

### Frontend not connecting to backend
- Verify VITE_API_URL is correct
- Check browser console for specific error messages
- Ensure backend is running (may take time to wake up on free tier)

## Local Development

To run locally after deployment:
1. Update `frontend/.env.development` with local API URL
2. Update `backend/.env` with local database (or use Neon URL for development)
3. Run both frontend and backend as usual