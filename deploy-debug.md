# Deployment & Debugging Checklist

## 🚀 Deployment Steps

### Backend Deployment
- [ ] Build backend: `cd backend && npm run build`
- [ ] Commit and push changes: `git add . && git commit -m "message" && git push`
- [ ] SSH to server and pull latest changes
- [ ] Restart backend service: `sudo systemctl restart your-backend-service`
- [ ] Check backend health: `curl https://your-domain.com/api/health`

### Frontend Deployment
- [ ] Build frontend: `cd frontend && npm run build`
- [ ] Check dist/ folder has latest files
- [ ] Commit and push changes
- [ ] Reload nginx if needed: `sudo systemctl reload nginx`

## 🔧 Common Issues & Solutions

### API CORS Errors
- [ ] Check backend CORS configuration in `app.ts`
- [ ] Verify allowed origins include frontend domain
- [ ] Restart backend after CORS changes

### Frontend Not Updating
- [ ] Clear browser cache (Ctrl+F5)
- [ ] Check if dist/ folder has latest build files
- [ ] Verify nginx is serving from correct directory
- [ ] Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### Backend Health Check Failing
- [ ] Check backend logs: `sudo journalctl -u your-backend-service -f`
- [ ] Verify .env file exists and has correct values
- [ ] Check database connection
- [ ] Verify port is not blocked by firewall

### Navigation Issues
- [ ] Check React Router configuration
- [ ] Verify useNavigate hook is used correctly
- [ ] Test back button functionality
- [ ] Check for console errors in browser dev tools

## 📋 Priority Tasks Status

### ✅ Completed
1. **Fix API CORS Error (Critical)** - CORS middleware added to backend

### 🔄 In Progress
2. **Back Button Navigates to Main Page** - Updated AIAssistant to use useNavigate
3. **Default Page Should Be Main Page** - Confirmed routing is correct
4. **Deployed Site Not Reflecting Latest Update** - Checking build status

### 📝 Pending
5. **Checklist File** - This file created

## 🛠️ Quick Commands

```bash
# Backend health check
curl https://your-domain.com/api/health

# Frontend build
cd frontend && npm run build

# Backend build
cd backend && npm run build

# Check nginx status
sudo systemctl status nginx

# Check backend status
sudo systemctl status your-backend-service

# View nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## 🔍 Debugging Tips

1. **Always check browser console** for JavaScript errors
2. **Check network tab** for failed API requests
3. **Verify environment variables** are set correctly
4. **Test endpoints directly** with curl or Postman
5. **Check server logs** for backend errors
6. **Clear browser cache** when testing frontend changes

## 📞 Emergency Contacts

- Server SSH access: `ssh user@your-server-ip`
- Nginx config: `/etc/nginx/sites-available/your-site`
- Backend logs: `sudo journalctl -u your-backend-service`
- Frontend build: `frontend/dist/` 