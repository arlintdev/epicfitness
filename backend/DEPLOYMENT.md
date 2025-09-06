# Backend Deployment Guide

## Deployment to Render (Free Tier)

### Prerequisites
1. Create a free account at [render.com](https://render.com)
2. Connect your GitHub account
3. Fork or push this repository to your GitHub

### Step 1: Create PostgreSQL Database
1. In Render Dashboard, click "New +" → "PostgreSQL"
2. Name: `epic-fitness-db`
3. Select "Free" plan
4. Click "Create Database"
5. Wait for database to be created
6. Copy the "External Database URL" - you'll need this

### Step 2: Deploy Backend
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select the repository containing this code
4. Configure:
   - Name: `epicfitness-backend`
   - Root Directory: `backend` (if in monorepo)
   - Environment: `Node`
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npm run start`
5. Select "Free" plan
6. Click "Advanced" to add environment variables

### Step 3: Configure Environment Variables
Add these environment variables in Render:

```env
NODE_ENV=production
DATABASE_URL=[paste your PostgreSQL External URL from Step 1]
JWT_SECRET=[click Generate to create a random value]
JWT_REFRESH_SECRET=[click Generate to create a random value]
SESSION_SECRET=[click Generate to create a random value]
FRONTEND_URL=https://epicfitness.arlint.dev
API_VERSION=v1
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=10000
```

### Step 4: Initialize Database
After deployment:
1. Go to your web service in Render
2. Click "Shell" tab
3. Run: `npx prisma migrate deploy`
4. Run: `npm run db:seed` (optional - adds sample data)

### Step 5: Update Frontend
Update your frontend API URL to point to your Render backend:
- URL format: `https://epicfitness-backend.onrender.com/api/v1`

## Alternative: Deploy to Railway

### Prerequisites
1. Create account at [railway.app](https://railway.app)
2. Install Railway CLI: `npm install -g @railway/cli`

### Deploy Steps
```bash
# Login to Railway
railway login

# Initialize project in backend directory
cd backend
railway init

# Add PostgreSQL
railway add --plugin postgresql

# Deploy
railway up

# Set environment variables in Railway dashboard
```

## Alternative: Deploy to Fly.io

### Prerequisites
1. Create account at [fly.io](https://fly.io)
2. Install flyctl: `curl -L https://fly.io/install.sh | sh`

### Deploy Steps
```bash
# Login
flyctl auth login

# Launch app
cd backend
flyctl launch

# Create PostgreSQL
flyctl postgres create

# Attach database
flyctl postgres attach <db-name>

# Deploy
flyctl deploy

# Set secrets
flyctl secrets set JWT_SECRET=<value> JWT_REFRESH_SECRET=<value> SESSION_SECRET=<value>
```

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| NODE_ENV | Environment (production) | Yes |
| DATABASE_URL | PostgreSQL connection string | Yes |
| JWT_SECRET | Secret for JWT tokens | Yes |
| JWT_REFRESH_SECRET | Secret for refresh tokens | Yes |
| SESSION_SECRET | Express session secret | Yes |
| FRONTEND_URL | Your frontend URL | Yes |
| API_VERSION | API version (v1) | Yes |
| JWT_EXPIRES_IN | Token expiry (15m) | Yes |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiry (7d) | Yes |
| PORT | Server port (auto-set by host) | No |

## Post-Deployment Checklist

- [ ] Database is connected and migrations run
- [ ] API responds at `/api/v1/health`
- [ ] CORS is configured for your frontend domain
- [ ] Environment variables are set
- [ ] Logs show no critical errors

## Troubleshooting

### Database Connection Issues
- Ensure DATABASE_URL is correctly formatted
- Check if database is running
- Verify SSL settings (add `?sslmode=require` to DATABASE_URL if needed)

### Build Failures
- Check Node version compatibility (needs Node 18+)
- Ensure all dependencies are in package.json
- Try running `npm run start` locally first

### CORS Issues
- Verify FRONTEND_URL is correctly set
- Check browser console for specific CORS errors
- Ensure credentials are included in frontend requests

## Support
For issues specific to:
- Render: [render.com/docs](https://render.com/docs)
- Railway: [docs.railway.app](https://docs.railway.app)
- Fly.io: [fly.io/docs](https://fly.io/docs)