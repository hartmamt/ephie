# How to Merge to Main Branch (For Auto-Deploy)

This guide shows you how to merge your current development branch to `main` so auto-deploy can work.

## Current Status

You're currently on: `claude/uno-rummy-game-011CULXccFZ8AiZunzdqBCMa`

To enable auto-deploy, you need to merge this to `main`.

---

## Quick Merge (Recommended)

```bash
# 1. Make sure all changes are committed
git status

# 2. Switch to main branch (create if doesn't exist)
git checkout -b main 2>/dev/null || git checkout main

# 3. Merge your development branch
git merge claude/uno-rummy-game-011CULXccFZ8AiZunzdqBCMa

# 4. Push to GitHub
git push -u origin main
```

**Done!** Now you can set up auto-deploy pointing to the `main` branch.

---

## Step-by-Step Explanation

### Step 1: Check Your Current Status

```bash
git status
```

Make sure everything is committed. You should see:
```
On branch claude/uno-rummy-game-011CULXccFZ8AiZunzdqBCMa
nothing to commit, working tree clean
```

If you have uncommitted changes:
```bash
git add .
git commit -m "Save current changes"
```

### Step 2: Switch to Main Branch

```bash
# If main doesn't exist, create it
git checkout -b main

# If main already exists, switch to it
git checkout main
```

### Step 3: Merge Development Branch

```bash
git merge claude/uno-rummy-game-011CULXccFZ8AiZunzdqBCMa
```

This brings all your multiplayer changes into `main`.

### Step 4: Push to GitHub

```bash
git push -u origin main
```

Now your `main` branch is on GitHub!

---

## Set Up Auto-Deploy

After merging to `main`, follow **[AUTO_DEPLOY.md](AUTO_DEPLOY.md)** to set up:

### Railway (30 seconds):
1. Go to [railway.app](https://railway.app)
2. Login with GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Node.js
6. Done! Every push to `main` auto-deploys!

### Render:
1. Go to [render.com](https://render.com)
2. Login with GitHub
3. "New +" → "Web Service"
4. Connect your repository
5. Set branch to `main`
6. Done! Auto-deploys on every push!

---

## Future Workflow

After setup, your workflow becomes:

### For Development:
```bash
# Work on a feature branch
git checkout -b feature/new-card

# Make changes, commit
git add .
git commit -m "Add new card type"

# Test locally
npm start
```

### To Deploy:
```bash
# Merge to main
git checkout main
git merge feature/new-card

# Push to trigger auto-deploy
git push origin main

# Railway/Render automatically deploys!
```

---

## Troubleshooting

### "Main branch doesn't exist"

Create it:
```bash
git checkout -b main
git push -u origin main
```

### "Merge conflicts"

If you see conflicts:
```bash
# See which files have conflicts
git status

# Edit files to resolve conflicts
# Look for <<<<<<< HEAD markers

# After fixing, commit
git add .
git commit -m "Resolve merge conflicts"
```

### "Already up to date"

This is fine! It means `main` already has all changes from your branch.

---

## Summary

```bash
# Quick version:
git checkout -b main 2>/dev/null || git checkout main
git merge claude/uno-rummy-game-011CULXccFZ8AiZunzdqBCMa
git push -u origin main

# Then set up Railway/Render to auto-deploy from main branch!
```

After this, **every push to `main` automatically deploys your game!** 🚀
