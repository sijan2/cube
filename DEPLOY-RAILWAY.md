# 🚀 Deploy LeetCode MCP + MetaMCP to Railway

This guide will help you deploy your integrated LeetCode MCP server with MetaMCP proxy to Railway.

## Prerequisites

- [Railway CLI](https://railway.app/) installed
- Git repository pushed to GitHub/GitLab
- Railway account

## Quick Deploy

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Initialize and Deploy
```bash
# In your project root
railway init
railway up
```

## Manual Setup Steps

### 1. Create Railway Project

1. Go to [Railway](https://railway.app/)
2. Click **"New Project"**
3. Choose **"Deploy from GitHub repo"**
4. Select your repository

### 2. Configure Environment Variables

In Railway dashboard, go to **Variables** and add:

```env
NODE_ENV=production
LEETCODE_SITE=global
```

**Optional variables:**
```env
LEETCODE_SESSION=your_session_cookie
METAMCP_AUTH_ENABLED=false
```

### 3. Railway Auto-Deploy

Railway will automatically:
- Detect `railway.json` configuration
- Use `Dockerfile.railway` for build
- Set up automatic deployments on git push
- Provide a public URL

## Access Your Deployed Service

Once deployed, Railway will provide a URL like: `https://your-app.railway.app`

### Available Endpoints:

- **Health Check:** `https://your-app.railway.app/health`
- **SSE Stream:** `https://your-app.railway.app/sse`
- **API Tools:** `https://your-app.railway.app/api/tools/call`

### Test Your Deployment:

```bash
# Test health endpoint
curl https://your-app.railway.app/health

# Test LeetCode daily problem
curl -X POST https://your-app.railway.app/api/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name": "get_daily_problem", "arguments": {}}'
```

## Configuration Files Explained

- `railway.json` - Railway deployment configuration
- `Dockerfile.railway` - Optimized Docker build for Railway
- `metamcp-config.railway.json` - MetaMCP configuration with Railway-specific settings
- `start-railway.sh` - Startup script for the Railway environment
- `.railwayignore` - Files to exclude from deployment

## Monitoring and Logs

```bash
# View deployment logs
railway logs

# Monitor your service
railway status
```

## Custom Domain (Optional)

1. In Railway dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS records as shown

## Environment-Specific Configuration

The deployment uses environment variables for configuration:

- `PORT` - Automatically set by Railway
- `LEETCODE_SITE` - Set to "global" or "cn"
- `LEETCODE_SESSION` - Optional session cookie for authenticated requests
- `NODE_ENV` - Set to "production"

## Scaling and Performance

Railway automatically handles:
- HTTPS certificates
- Load balancing
- Auto-scaling based on usage
- Health checks

## Cost Estimation

Railway pricing is usage-based:
- **Hobby Plan:** $5/month with generous limits
- **Pro Plan:** $20/month for production use
- Additional usage charges apply

## Troubleshooting

### Build Issues
```bash
# Check build logs
railway logs --deployment

# Rebuild
railway up --detach
```

### Service Not Starting
1. Check environment variables are set correctly
2. Verify `PORT` is not manually set (Railway sets this automatically)
3. Check the startup logs for errors

### MetaMCP Not Accessible
- Ensure the service is listening on `0.0.0.0:$PORT`
- Check that CORS is enabled in `metamcp-config.railway.json`
- Verify health endpoint responds: `/health`

## Support

- **Railway Docs:** https://docs.railway.app/
- **MetaMCP Issues:** https://github.com/metatool-ai/metamcp/issues
- **LeetCode Query Issues:** https://github.com/your-username/your-repo/issues