# 🚀 Deployment Checklist - Tez Dashboard

## ✅ Pre-Deployment Checklist

### 1. Backend Setup
- [ ] Django backend is deployed and accessible
- [ ] Backend API URL is confirmed (e.g., https://api.yourdomain.com)
- [ ] CORS is configured to allow frontend domain
- [ ] SSL certificate is installed on backend
- [ ] Database is migrated and ready
- [ ] Media files storage is configured (for equipment images)

### 2. Frontend Configuration
- [ ] Update `.env.production.local` with production API URL
- [ ] Remove/comment out debug console.logs (optional)
- [ ] Test build locally: `npm run build`
- [ ] Verify all environment variables are prefixed with `NEXT_PUBLIC_`

### 3. Domain & DNS
- [ ] Domain name purchased (if using custom domain)
- [ ] DNS records ready to update

---

## 🎯 Deployment Method Selection

Choose ONE method below and complete its checklist:

### Option A: Vercel (FASTEST - 5 minutes)

**Best for:** Quick deployment, automatic CI/CD, free tier

- [ ] Push code to GitHub repository
- [ ] Sign up at https://vercel.com
- [ ] Import GitHub repository
- [ ] Add environment variable: `NEXT_PUBLIC_API_BASE_URL`
- [ ] Click Deploy
- [ ] Test deployed site
- [ ] (Optional) Add custom domain in Vercel settings

**Commands:**
```bash
# Quick deploy with Vercel CLI
npm install -g vercel
vercel --prod
```

---

### Option B: Netlify

**Best for:** Alternative to Vercel, great UI

- [ ] Push code to GitHub
- [ ] Sign up at https://netlify.com
- [ ] Import repository
- [ ] Set build command: `npm run build`
- [ ] Set publish directory: `.next`
- [ ] Add environment variable: `NEXT_PUBLIC_API_BASE_URL`
- [ ] Deploy

---

### Option C: VPS/Cloud Server (AWS, DigitalOcean, Linode)

**Best for:** Full control, custom infrastructure

- [ ] Server provisioned with Ubuntu 20.04+
- [ ] Node.js 18+ installed
- [ ] PM2 installed globally
- [ ] Nginx installed and configured
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] Firewall configured (ports 80, 443, 22)

**Setup Steps:**
```bash
# 1. Clone repository on server
git clone your-repo.git
cd tez-dashboard/template/javascript-version

# 2. Install dependencies
npm install

# 3. Create environment file
nano .env.production.local
# Add: NEXT_PUBLIC_API_BASE_URL=https://your-api.com/api/

# 4. Build
npm run build

# 5. Start with PM2
pm2 start npm --name "tez-dashboard" -- start
pm2 save
pm2 startup

# 6. Configure Nginx (see DEPLOYMENT.md)
```

---

### Option D: Docker

**Best for:** Containerized deployment, Kubernetes

- [ ] Docker installed on deployment machine
- [ ] Registry access configured (Docker Hub, AWS ECR, etc.)
- [ ] Environment variables configured

**Commands:**
```bash
# Build image
docker build -t tez-dashboard .

# Run locally to test
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=https://your-api.com/api/ \
  tez-dashboard

# Tag and push
docker tag tez-dashboard your-registry/tez-dashboard:v1.0
docker push your-registry/tez-dashboard:v1.0
```

---

## 🔧 Post-Deployment Tasks

### Immediate Testing
- [ ] Visit deployed URL
- [ ] Test login functionality
- [ ] Verify API connections work
- [ ] Check equipment images load
- [ ] Test file uploads (equipment images, documents)
- [ ] Verify charts render correctly
- [ ] Test all CRUD operations
- [ ] Check mobile responsiveness
- [ ] Test on different browsers (Chrome, Safari, Firefox)

### Backend Configuration
- [ ] Update Django CORS_ALLOWED_ORIGINS with frontend URL
  ```python
  CORS_ALLOWED_ORIGINS = [
      "https://your-frontend.vercel.app",
      "https://yourdomain.com"
  ]
  ```
- [ ] Update Django CSRF_TRUSTED_ORIGINS
  ```python
  CSRF_TRUSTED_ORIGINS = [
      "https://your-frontend.vercel.app",
      "https://yourdomain.com"
  ]
  ```

### Security
- [ ] API requests use HTTPS only
- [ ] JWT tokens stored securely
- [ ] Rate limiting configured on backend
- [ ] Environment variables not exposed in client code
- [ ] Content Security Policy configured

### Performance
- [ ] Enable caching headers
- [ ] Compress static assets
- [ ] Optimize images
- [ ] Enable CDN (if applicable)
- [ ] Monitor Core Web Vitals

### Monitoring & Analytics
- [ ] Setup error tracking (Sentry, LogRocket, etc.)
- [ ] Configure uptime monitoring
- [ ] Setup performance monitoring
- [ ] Add Google Analytics (optional)
- [ ] Configure alerts for downtime

---

## 🐛 Common Issues & Solutions

### Issue: "API calls returning 404"
**Solution:** 
- Check `.env.production.local` has correct API URL
- Verify backend is running and accessible
- Check CORS configuration on backend

### Issue: "Images not loading"
**Solution:**
- Check backend media URL configuration
- Verify CORS allows image requests
- Check Next.js image domains in `next.config.mjs`

### Issue: "Build fails with errors"
**Solution:**
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Issue: "Environment variables not working"
**Solution:**
- Ensure they start with `NEXT_PUBLIC_`
- Rebuild after changing env vars
- Check deployment platform env var settings

### Issue: "Charts not rendering"
**Solution:**
- Check browser console for errors
- Verify ApexCharts is included in build
- Check theme initialization

---

## 📊 Deployment Status Tracker

### Initial Deployment
- [ ] Frontend deployed: _________________ (URL)
- [ ] Backend running: _________________ (URL)
- [ ] Custom domain configured: _________________ (if applicable)
- [ ] SSL certificate active: Yes / No
- [ ] Deployment date: _________________

### Team Access
- [ ] Team members invited to deployment platform
- [ ] Repository access granted
- [ ] Documentation shared

### Maintenance Plan
- [ ] Backup strategy defined
- [ ] Update schedule established
- [ ] Monitoring alerts configured
- [ ] Support contact information documented

---

## 🎉 You're Ready!

Once all checkboxes are complete:

1. ✅ Your dashboard is live
2. ✅ Users can access it
3. ✅ Backend is connected
4. ✅ Monitoring is active

**Next Steps:**
- Train users
- Monitor for issues
- Plan future features
- Celebrate! 🎊

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check deployment platform logs
3. Verify backend API is responding
4. Review DEPLOYMENT.md for detailed guides
