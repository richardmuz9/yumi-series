# 🚂 Railway Deployment Guide

## Why Railway vs DigitalOcean?
- **Auto-scaling**: Railway automatically handles traffic spikes
- **Zero-downtime deployments**: No manual restarts needed
- **Better error handling**: Automatic restarts on crashes
- **HTTPS by default**: No SSL certificate setup required

## 1. Deploy Backend to Railway

### Quick Setup:
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `websitehelper` repository
5. Choose "Deploy from root directory"

### Environment Variables (Railway Dashboard → Variables):
```
NODE_ENV=production
PORT=3000
OPENAI_API_KEY=your_actual_openai_key
OPENROUTER_API_KEY=your_actual_openrouter_key  
QWEN_API_KEY=your_actual_qwen_key
```

## 2. Update Frontend URLs

After Railway deployment, you'll get a URL like:
`https://websitehelper-production-abc123.up.railway.app`

### Update these files with your Railway URL:

**frontend/.env** (create this file):
```
VITE_API_URL=https://your-railway-url.up.railway.app
VITE_FRONTEND_URL=https://yumi77965.online
```

**frontend/netlify.toml** (already updated):
- Replace `your-railway-app.up.railway.app` with your actual Railway URL

## 3. Test the API

After deployment:
1. Visit `https://your-railway-url.up.railway.app/health`
2. Should return: `{"status":"ok"}`
3. If it works, update your frontend environment variables
4. Redeploy your frontend

## 4. Why This Fixes Your API Issues

### DigitalOcean Problems:
- ❌ Manual server management
- ❌ Process crashes without auto-restart
- ❌ No automatic HTTPS
- ❌ Complex firewall/networking setup

### Railway Solutions:
- ✅ Automatic process monitoring
- ✅ Built-in HTTPS and CDN
- ✅ Zero-config networking
- ✅ Automatic restarts on failure
- ✅ Real-time logs and monitoring

## 5. Railway Free Tier Details

- **$5 credit/month** (~750 service hours)
- **Automatic sleep** after 1 hour idle (wakes in ~10 seconds)
- **1GB RAM, 1 vCPU** per service
- **Custom domains** supported
- **No credit card** required initially

## 6. Alternative Free Options (if Railway doesn't work)

| Provider | Free Tier | Pros | Cons |
|----------|-----------|------|------|
| **Render** | 750 hrs/month | Always-on free tier | Slower cold starts |
| **Fly.io** | 3 VMs free | Fast, good uptime | More complex setup |
| **Vercel** | Serverless functions | Zero cold start | Function limitations |

## Quick Deploy Commands:

```bash
# If you prefer CLI (after Railway web setup):
npm install -g @railway/cli
railway login
railway link [your-project-id]
railway up
```

## Next Steps:
1. Deploy to Railway first
2. Test the `/health` endpoint
3. Update frontend environment variables
4. Test your app end-to-end
5. If still having issues, try Render or Fly.io 