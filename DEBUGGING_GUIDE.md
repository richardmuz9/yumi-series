# 🔍 Yumi Series Debugging Guide

## Issues Being Tracked

### 1. PWA Install Prompt Unresponsive
### 2. Global Language Toggle Not Propagating  
### 3. Signup & Billing APIs Returning 401/User Not Found

---

## 🚀 How to Use This Debug Version

### **Step 1: Deploy with Debug Logging**
All components now have comprehensive logging. Deploy your app and open the browser console.

### **Step 2: Check Console Logs**
Look for logs with these prefixes:
- `[PWA]` - PWA installation debugging
- `[i18n]` - Language switching debugging  
- `[Auth]` - Authentication debugging
- `[API]` - API request/response debugging
- `[UI]` - User interface debugging

---

## 🔧 Debug Check #1: PWA Installation

### **What to Look For:**

1. **App Startup Logs:**
   ```
   [PWA][MainPage] App initialization - PWA checks:
     - Service Worker support: true
     - Current protocol: https:
     - Is HTTPS: true
     - Is standalone mode: false
     - Has navigator.standalone: false
     - Window.deferredPrompt exists: false
   ```

2. **beforeinstallprompt Event:**
   ```
   [PWA] beforeinstallprompt fired! Event { ... }
   [PWA] Event details: { type: "beforeinstallprompt", platforms: [...] }
   [PWA] Deferred prompt stored, isInstallable set to true
   ```

3. **Install Button Click:**
   ```
   [PWA] Install button clicked!
   [PWA] Current state: { deferredPrompt: true, isInstallable: true, ... }
   [PWA] Starting PWA installation...
   [PWA] Install prompt result: { outcome: "accepted" }
   ```

### **Diagnosis:**

- **If you NEVER see `beforeinstallprompt` logs:** 
  - Check manifest.json validity in DevTools > Application > Manifest
  - Verify service worker is active in DevTools > Application > Service Workers
  - Ensure the app meets PWA installability criteria

- **If `beforeinstallprompt` fires but install button doesn't work:**
  - Check if deferredPrompt is properly stored
  - Look for JavaScript errors during button click

- **If install prompt shows but outcome is "dismissed":**
  - This is normal user behavior - they chose not to install

---

## 🌍 Debug Check #2: Language Switching

### **What to Look For:**

1. **Language Switch Initiation:**
   ```
   [i18n] Language switch initiated from: en to: ja
   [i18n] Current translations before switch: ["title", "subtitle", ...]
   [i18n] Document language updated to: ja-JP
   [i18n] New translations loaded: ["title", "subtitle", ...]
   ```

2. **Event Propagation:**
   ```
   [i18n] Dispatching languageChanged event with detail: { language: "ja", ... }
   [i18n] Dispatching forceRerender event
   ```

3. **Component Reception:**
   ```
   [UI][MainPage] Received language change event: { language: "ja", ... }
   [UI][MainPage] Current language state: ja
   [UI][MainPage] Current translations sample: { title: "Yumi シリーズ", ... }
   ```

### **Diagnosis:**

- **If language switch logs appear but UI doesn't update:**
  - Check if components are receiving the `languageChanged` event
  - Verify translation keys exist for the target language
  - Look for React rendering issues

- **If no event logs appear:**
  - Language selector might not be triggering `switchLanguage()`
  - Check if useGlobalLanguage hook is properly imported

- **If events fire but translations are wrong:**
  - Verify translation files contain the correct keys
  - Check if `getTranslation()` function returns expected values

---

## 🔐 Debug Check #3: Authentication & API Issues

### **What to Look For:**

1. **Frontend Signup Process:**
   ```
   [Auth][Frontend] Starting signup process for: { email: "user@example.com", username: "user" }
   [Auth][Frontend] Request body (password hidden): { email: "user@example.com", username: "user", passwordLength: 8 }
   [Auth][Frontend] Response status: 201
   [Auth][Frontend] Response data: { success: true, hasUser: true, hasToken: true, tokenLength: 180 }
   [Auth][Frontend] Storing auth token and user data
   ```

2. **Backend Signup Process:**
   ```
   [API][Signup] Request received
   [API][Signup] Request body: { email: "user@example.com", username: "user", password: "..." }
   [API][Signup] Creating new user for: { email: "user@example.com", username: "user" }
   [DB] createUser result: { lastID: 2, changes: 1 }
   [API][Signup] User created successfully: { id: 2, email: "user@example.com", username: "user" }
   [API][Signup] JWT token generated for user ID: 2
   ```

3. **API Request Authentication:**
   ```
   [API][Request] GET /api/auth/profile
   [API][Request] Headers: { "Authorization": "Bearer eyJhbGciOiJIUzI1...", "Has-Cookie-Credentials": "include" }
   [API][Response] GET /api/auth/profile - Status: 200
   [API][Response] GET /api/auth/profile - Data: { success: true, hasUser: true }
   ```

### **Diagnosis:**

- **If database creation fails (no lastID):**
  - Database permission issue - check SQLite write access
  - Look for `[DB] Database INSERT failed - no lastID returned` 
  - The fixed `runAsync` function should resolve this

- **If signup succeeds but profile calls return 401:**
  - JWT token not being sent with requests
  - Token validation failing on backend
  - Check that `localStorage.setItem('authToken', token)` worked

- **If requests show "Authorization: none":**
  - Token not stored in localStorage  
  - API client not including stored token in requests

---

## 🎯 Next Steps Based on Logs

### **No PWA beforeinstallprompt Event:**
1. Check DevTools > Application > Manifest for errors
2. Verify Service Worker registration in DevTools > Application > Service Workers  
3. Test on different browsers/devices
4. Try clearing site data and reload

### **Language Events Fire But UI Doesn't Update:**
1. Add manual refresh test: `i18n.changeLanguage(lang).then(() => window.location.reload())`
2. Check if translation provider is at app root level
3. Verify React component re-render triggers

### **Auth Works But API Calls Fail:**
1. Check Network tab for Authorization headers
2. Verify JWT token format and expiration
3. Test API endpoints directly with curl/Postman
4. Check backend middleware authentication logic

---

## 🚨 Emergency Debugging Commands

If you need to force-debug any issue:

```javascript
// In browser console - check PWA state
console.log('PWA Debug:', {
  deferredPrompt: window.deferredPrompt,
  serviceWorker: 'serviceWorker' in navigator,
  standalone: window.matchMedia('(display-mode: standalone)').matches
})

// Check language state  
console.log('Language Debug:', {
  currentLang: localStorage.getItem('yumiLanguage'),
  documentLang: document.documentElement.lang,
  translations: Object.keys(window.translations || {})
})

// Check auth state
console.log('Auth Debug:', {
  token: localStorage.getItem('authToken'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  cookieHeader: document.cookie
})
```

---

## 📝 Share These Logs

When reporting issues, please share:
1. Complete console logs with `[PWA]`, `[i18n]`, `[Auth]`, `[API]` prefixes
2. Network tab showing failed requests  
3. Browser/device information
4. Steps to reproduce the issue

This will help pinpoint the exact failure point! 🔍 