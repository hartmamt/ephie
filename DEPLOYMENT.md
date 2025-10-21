# Deployment Guide - UNO Rummy Flip

This guide explains how to deploy your multiplayer UNO Rummy Flip game online.

## Important Note About Vercel

**Vercel does not fully support WebSocket connections** required for real-time multiplayer gaming with Socket.io. While Vercel is excellent for static sites and serverless functions, this game needs a persistent connection for the best multiplayer experience.

### Recommended Platforms for Multiplayer

We recommend deploying to one of these platforms that fully support WebSockets:

1. **Railway** (Recommended - Easy & Free tier available)
2. **Render** (Free tier available)
3. **Fly.io** (Free tier available)
4. **Heroku** (Paid)

---

## Option 1: Deploy to Railway (Recommended ⭐)

Railway is the easiest platform for deploying Node.js apps with WebSocket support.

### Steps:

1. **Create a Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Install Railway CLI** (optional)
   ```bash
   npm install -g @railway/cli
   ```

3. **Deploy via GitHub**
   - Push your code to GitHub
   - Go to Railway dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect Node.js and deploy!

4. **Deploy via CLI**
   ```bash
   railway login
   railway init
   railway up
   ```

5. **Generate Domain**
   - In Railway dashboard, go to your project
   - Click "Settings" → "Generate Domain"
   - Your game will be live at `your-app.railway.app`

### Configuration:
Railway automatically detects `package.json` and runs `npm start`. No additional configuration needed!

---

## Option 2: Deploy to Render

### Steps:

1. **Create a Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: uno-rummy-flip
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free

3. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your app
   - Your game will be live at `your-app.onrender.com`

---

## Option 3: Deploy to Fly.io

### Steps:

1. **Install Fly CLI**
   ```bash
   # Mac/Linux
   curl -L https://fly.io/install.sh | sh

   # Windows
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. **Sign Up/Login**
   ```bash
   fly auth signup
   # or
   fly auth login
   ```

3. **Launch Your App**
   ```bash
   fly launch
   ```

4. **Follow Prompts**
   - Choose app name
   - Select region closest to your players
   - Don't add PostgreSQL
   - Deploy now: Yes

5. **Access Your App**
   - Your game will be live at `your-app.fly.dev`

---

## Option 4: Local Testing

Before deploying, test locally:

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Server**
   ```bash
   npm start
   ```

3. **Open Browser**
   - Go to `http://localhost:3000`
   - Open multiple browser tabs/windows to test multiplayer

4. **Test on Local Network**
   - Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Access from other devices: `http://YOUR_IP:3000`

---

## Environment Variables

No environment variables required! The game works out of the box.

The server automatically uses:
- Port 3000 locally
- `process.env.PORT` on deployment (set by hosting platform)

---

## Troubleshooting

### Players Can't Connect

**Issue**: "Disconnected from server" message

**Solutions**:
1. Make sure server is running
2. Check firewall settings
3. Verify hosting platform supports WebSockets
4. Check browser console for errors

### Game Lags or Disconnects

**Solutions**:
1. Choose hosting region close to players
2. Check internet connection
3. Try a different browser
4. Restart the server

### Room Not Found

**Solutions**:
1. Room codes are case-sensitive (enter in UPPERCASE)
2. Room may have been closed (all players left)
3. Server may have restarted (rooms are in-memory)

---

## Performance Tips

1. **Choose the Right Region**: Deploy to a region geographically close to most players

2. **Upgrade Hosting Plan**: Free tiers may have limitations:
   - Railway: 500 hours/month free
   - Render: May sleep after inactivity
   - Fly.io: Limited free hours

3. **Monitor Usage**: Check your hosting dashboard for:
   - Active connections
   - Memory usage
   - Request counts

---

## What About Vercel?

If you still want to use Vercel for hosting the static files, you would need to:

1. **Deploy frontend to Vercel**
   - Only deploy the `public/` folder
   - Update socket connection to point to separate backend

2. **Deploy backend separately**
   - Use Railway/Render for the Socket.io server
   - Update frontend to connect to that server URL

3. **Update Socket Connection**
   ```javascript
   // In game-multiplayer.js
   const socket = io('https://your-backend.railway.app');
   ```

However, this is more complex and not recommended for beginners.

---

## Recommended Setup

For the **best experience**:

✅ Deploy to **Railway** (easiest, free, fully functional)
✅ Use the provided configuration (works out of the box)
✅ Share the generated URL with friends to play!

---

## Quick Start Summary

```bash
# 1. Install dependencies
npm install

# 2. Test locally
npm start

# 3. Push to GitHub
git add .
git commit -m "Ready to deploy"
git push

# 4. Deploy to Railway
# - Go to railway.app
# - Connect GitHub repo
# - Deploy!
```

That's it! Your multiplayer game will be live and ready to play! 🎮
