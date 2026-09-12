# Production Deployment Guide // NEXUS ARENA

This guide outlines deployment procedures for taking **NEXUS ARENA** live to the public internet using production cloud infrastructure.

---

## Architecture Overview

NEXUS ARENA is designed for full flexibility:
- **Unified Full-Stack Deployment (Recommended)**: `backend/server.js` serves the modern cyberpunk static frontend client directly from the `/frontend` directory. A single Web Service container hosts both the API and client with zero cross-origin (CORS) friction.
- **Decoupled Deployment**: Host the Node.js API engine on a cloud service (Render, Railway, Fly.io, AWS, DigitalOcean) and host the frontend on Netlify, Vercel, or Cloudflare Pages.

---

## Option A: Single Unified Cloud Service (Render / Railway)

Because `frontend/js/api.js` automatically detects production vs local environments, no manual URL changes are needed.

### 1. Initialize Git Repository & Push to GitHub
```bash
cd nexus-arena
git init
git add .
git commit -m "feat: launch Nexus Arena competitive platform"
git branch -M main
git remote add origin https://github.com/<your-github-username>/nexus-arena.git
git push -u origin main
```

### 2. Deploy to Render
1. Navigate to https://render.com and log in.
2. Select **New +** → **Web Service**.
3. Link your GitHub repository (`nexus-arena`).
4. Configure service parameters:
   - **Name:** `nexus-arena`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (or Starter for production performance)
5. Add Environment Variables:
   | Key | Value |
   | :--- | :--- |
   | `MONGO_URI` | `mongodb+srv://<user>:<password>@cluster.mongodb.net/nexusarena?retryWrites=true&w=majority` |
   | `JWT_SECRET` | `<your-cryptographic-random-secret>` |
   | `JWT_EXPIRE` | `7d` |
   | `NODE_ENV` | `production` |
6. Select **Deploy Web Service**.

Your platform will be live at:
```
https://nexus-arena.onrender.com
```

---

## Option B: Decoupled Cloud Architecture

### 1. Deploy Backend API
Deploy the `backend` folder to Render or Railway with the same environment variables.
Your API base URL will be:
```
https://nexus-api.onrender.com/api
```

### 2. Deploy Frontend (Vercel / Netlify)
If hosting the static frontend separately:
1. In `frontend/js/api.js`, update `API_BASE_URL` to point to your backend:
   ```js
   const API_BASE_URL = 'https://nexus-api.onrender.com/api';
   ```
2. Deploy the `frontend/` directory to Vercel or Netlify.
3. Ensure CORS on `backend/server.js` permits incoming connections from your frontend domain.

---

## Production Checklist

- [ ] MongoDB Atlas cluster initialized with IP access allowed (`0.0.0.0/0` or cloud static IP).
- [ ] Strong random string configured for `JWT_SECRET`.
- [ ] Admin/Organizer account created via the `/register.html` portal.
- [ ] Initial competitive tournament directives created via `/create-tournament.html`.
