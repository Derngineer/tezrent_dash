# 🚀 Deployment Guide for Tez Dashboard

## Prerequisites

Before deploying, ensure you have:
- ✅ Backend API deployed and accessible (Django REST API)
- ✅ Frontend code pushed to GitHub repository
- ✅ Production API URL ready

---

## Option 1: Vercel (Recommended - Easiest)

### Why Vercel?
- Built for Next.js (creators of Next.js)
- Free tier available
- Automatic deployments from GitHub
- Built-in CI/CD
- Global CDN

### Steps:

1. **Push your code to GitHub**
   ```bash
   cd /Users/derbymatoma/tezdashboard/template/javascript-version
   git init
   git add .
   git commit -m "Initial commit - Tez Dashboard"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/tez-dashboard.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables:
     - `NEXT_PUBLIC_API_BASE_URL` = `https://your-api-domain.com/api/`
   - Click "Deploy"

3. **Done!** Your app will be live at `https://your-project.vercel.app`

---

## Option 2: Netlify

### Steps:

1. **Push code to GitHub** (same as above)

2. **Deploy to Netlify**
   - Go to https://netlify.com
   - Sign up/Login
   - Click "Add new site" → "Import an existing project"
   - Choose your GitHub repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Environment variables:
     - `NEXT_PUBLIC_API_BASE_URL` = `https://your-api-domain.com/api/`
   - Click "Deploy"

---

## Option 3: VPS/Cloud Server (AWS, DigitalOcean, etc.)

### Requirements:
- Node.js 18+ installed
- PM2 or similar process manager
- Nginx as reverse proxy

### Steps:

1. **Prepare the server**
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   ```

2. **Clone and setup project**
   ```bash
   cd /var/www
   git clone https://github.com/YOUR_USERNAME/tez-dashboard.git
   cd tez-dashboard/template/javascript-version
   npm install
   ```

3. **Create environment file**
   ```bash
   nano .env.production.local
   ```
   
   Add:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api/
   ```

4. **Build the application**
   ```bash
   npm run build
   ```

5. **Start with PM2**
   ```bash
   pm2 start npm --name "tez-dashboard" -- start
   pm2 save
   pm2 startup
   ```

6. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/tez-dashboard
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/tez-dashboard /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

7. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## Option 4: Docker Deployment

### Steps:

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS builder
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci
   
   COPY . .
   RUN npm run build
   
   FROM node:18-alpine AS runner
   
   WORKDIR /app
   
   ENV NODE_ENV production
   
   COPY --from=builder /app/package*.json ./
   COPY --from=builder /app/.next ./.next
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/node_modules ./node_modules
   
   EXPOSE 3000
   
   CMD ["npm", "start"]
   ```

2. **Create .dockerignore**
   ```
   node_modules
   .next
   .git
   .env*.local
   ```

3. **Build and run**
   ```bash
   docker build -t tez-dashboard .
   docker run -p 3000:3000 -e NEXT_PUBLIC_API_BASE_URL=https://your-api.com/api/ tez-dashboard
   ```

---

## Pre-Deployment Checklist

### ✅ Before deploying:

1. **Create production environment file**
   ```bash
   cd /Users/derbymatoma/tezdashboard/template/javascript-version
   nano .env.production.local
   ```
   
   Add:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-production-api.com/api/
   ```

2. **Update CORS settings on backend**
   - Add your frontend domain to Django CORS_ALLOWED_ORIGINS
   - Example: `https://tez-dashboard.vercel.app`

3. **Test production build locally**
   ```bash
   npm run build
   npm start
   ```
   
   Visit http://localhost:3000 and test all features

4. **Remove console.logs** (Optional but recommended)
   - Search for `console.log` in your codebase
   - Remove or comment out debug logs

5. **Update backend API URL**
   - Ensure your Django backend is deployed
   - Note the production API URL

---

## Quick Start (Recommended)

**I recommend Vercel - here's the fastest way:**

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Navigate to your project
cd /Users/derbymatoma/tezdashboard/template/javascript-version

# 3. Deploy (will prompt for configuration)
vercel

# 4. Set environment variable when prompted
# NEXT_PUBLIC_API_BASE_URL = https://your-api-domain.com/api/

# 5. Deploy to production
vercel --prod
```

---

## Post-Deployment

### Configure Custom Domain (Optional)
1. Go to your deployment platform settings
2. Add custom domain
3. Update DNS records:
   - Type: A or CNAME
   - Point to deployment platform's servers

### Monitor Your App
- Check deployment logs
- Test all API endpoints
- Verify authentication works
- Test file uploads
- Check charts render correctly

---

## Troubleshooting

### Issue: "API calls fail in production"
**Solution:** Check CORS settings on backend, ensure API URL is correct

### Issue: "Environment variables not working"
**Solution:** Ensure variables start with `NEXT_PUBLIC_` and restart deployment

### Issue: "Images not loading"
**Solution:** Check Next.js image domains configuration in `next.config.mjs`

### Issue: "Build fails"
**Solution:** 
```bash
# Clear cache and rebuild
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

---

## Need Help?

Choose your deployment method and I'll guide you through it step-by-step!
