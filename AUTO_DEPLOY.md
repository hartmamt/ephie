# Auto-Deploy from GitHub (Push to Main)

This guide shows you how to set up **automatic deployment** so your game deploys every time you push to the `main` branch.

---

## ⭐ Option 1: Railway (RECOMMENDED - Best for This App)

Railway automatically detects and deploys Node.js + Socket.io apps perfectly.

### Setup Steps:

1. **Push your code to GitHub**
   ```bash
   git checkout main
   git merge claude/uno-rummy-game-011CULXccFZ8AiZunzdqBCMa
   git push origin main
   ```

2. **Connect Railway to GitHub**
   - Go to [railway.app](https://railway.app)
   - Click "Login" → Sign in with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect Node.js

3. **Configure Auto-Deploy**
   - Railway automatically sets up auto-deploy!
   - Click "Settings" → "Deploy Trigger"
   - Set branch to `main`
   - ✅ Now every push to `main` will auto-deploy!

4. **Generate Domain**
   - Go to "Settings" → "Networking"
   - Click "Generate Domain"
   - Your game will be at `your-app.up.railway.app`

### Auto-Deploy Configuration

The included `railway.json` file automatically configures:
- ✅ Build process
- ✅ Start command
- ✅ Restart policy
- ✅ Environment detection

**Every push to `main` → Automatic deployment!**

---

## Option 2: Render (Also Great for Auto-Deploy)

Render also fully supports Socket.io and auto-deploys from GitHub.

### Setup Steps:

1. **Push code to GitHub**
   ```bash
   git checkout main
   git merge claude/uno-rummy-game-011CULXccFZ8AiZunzdqBCMa
   git push origin main
   ```

2. **Connect Render to GitHub**
   - Go to [render.com](https://render.com)
   - Sign up/Login with GitHub
   - Click "New +" → "Web Service"
   - Click "Connect a repository"
   - Choose your repository

3. **Configure Service**
   - **Name**: uno-rummy-flip
   - **Branch**: main ← Auto-deploy from this branch
   - **Runtime**: Node
   - **Build Command**: npm install
   - **Start Command**: npm start
   - Click "Create Web Service"

### Auto-Deploy Configuration

The included `render.yaml` file automatically configures everything!

Render will:
- ✅ Auto-deploy on every push to `main`
- ✅ Install dependencies
- ✅ Start your server
- ✅ Provide a domain: `your-app.onrender.com`

**Every push to `main` → Automatic deployment!**

---

## ⚠️ Option 3: Vercel (NOT RECOMMENDED for This App)

### Why Vercel Doesn't Work Well:

❌ **Socket.io requires persistent WebSocket connections**
❌ **Vercel serverless functions timeout (10s Hobby, 60s Pro)**
❌ **Not designed for real-time multiplayer games**

### Workaround (Advanced):

If you MUST use Vercel, you need a **split deployment**:

1. **Deploy backend to Railway/Render** (for WebSockets)
2. **Deploy frontend to Vercel** (static files only)
3. **Configure frontend to connect to external backend**

#### Steps for Split Deployment:

**1. Deploy Backend to Railway**
```bash
# Follow Railway steps above
# Get your backend URL: https://your-app.railway.app
```

**2. Create Vercel-only frontend**

Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

**3. Update Socket.io connection**

Edit `public/game-multiplayer.js`:
```javascript
// Change this line:
socket = io();

// To:
socket = io('https://your-app.railway.app');
```

**4. Deploy to Vercel**
```bash
npm install -g vercel
vercel --prod
```

This is **complex** and **not recommended**. Use Railway instead!

---

## Comparison Table

| Platform | Auto-Deploy | WebSocket Support | Difficulty | Free Tier | Recommended |
|----------|-------------|-------------------|------------|-----------|-------------|
| **Railway** | ✅ Yes | ✅ Perfect | ⭐ Easy | ✅ 500hrs/mo | ⭐⭐⭐⭐⭐ |
| **Render** | ✅ Yes | ✅ Perfect | ⭐ Easy | ✅ Yes | ⭐⭐⭐⭐ |
| **Vercel** | ✅ Yes | ❌ Limited | ⭐⭐⭐ Hard | ✅ Yes | ❌ |

---

## Quick Start: Railway Auto-Deploy (30 Seconds!)

```bash
# 1. Merge to main
git checkout main
git merge claude/uno-rummy-game-011CULXccFZ8AiZunzdqBCMa
git push origin main

# 2. Go to railway.app
# 3. Login with GitHub
# 4. Click "Deploy from GitHub repo"
# 5. Select your repo
# 6. Done! Auto-deploy is set up!
```

Every future push to `main` will automatically deploy! 🚀

---

## Testing Auto-Deploy

After setup, test it:

```bash
# Make a small change
echo "console.log('Auto-deploy test');" >> server.js

# Commit and push to main
git add server.js
git commit -m "Test auto-deploy"
git push origin main

# Watch it deploy automatically!
# Railway/Render will detect the push and redeploy
```

---

## Branch-Based Deployment (Advanced)

### Deploy Different Branches

**Railway:**
- Main branch → Production
- Dev branch → Staging
- Create multiple services for different branches

**Render:**
- Create multiple web services
- Point each to different branches
- Perfect for staging + production

---

## Recommended Setup

✅ **Use Railway or Render** (not Vercel)
✅ **Push to `main` branch** for auto-deploy
✅ **Keep `claude/*` branches** for development
✅ **Merge to `main`** when ready to deploy

Your game will automatically deploy every time you push! 🎮
