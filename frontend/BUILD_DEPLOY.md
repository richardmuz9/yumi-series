# 🚀 Yumi Series - Build & Deploy Guide

This guide explains how to build and deploy Yumi Series across **Web (PWA)**, **Mobile (iOS & Android)**, and **Desktop** platforms from a single React/Vite codebase.

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## 🌐 Web Version (PWA)

### Development
```bash
# Start development server
npm run start:web
# or
npm run dev

# The app will be available at http://localhost:5173
# PWA features are enabled in development
```

### Building for Web
```bash
# Build optimized web version
npm run build:web

# Preview the build
npm run preview

# Files will be in ./dist directory
```

### PWA Features
- ✅ **Offline Support**: Service worker caches app and API responses
- ✅ **Install Prompt**: Users see "Add to Home Screen" on mobile/desktop
- ✅ **Standalone Mode**: Runs without browser UI when installed
- ✅ **Auto Updates**: Automatically updates when new version is deployed
- ✅ **Platform Integration**: Native-like experience on all platforms

### Deployment Options

#### Option 1: Static Hosting (Recommended)
```bash
# Deploy to Netlify
npm run build:web
# Upload ./dist folder to Netlify

# Deploy to Vercel
npm run build:web
# Upload ./dist folder to Vercel

# Deploy to GitHub Pages
npm run build:web
# Push ./dist contents to gh-pages branch
```

#### Option 2: Self-hosted
```bash
# Build and serve
npm run build:web
npx serve -s dist -p 3000
```

## 📱 Mobile Version (Capacitor)

### Prerequisites
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Java Development Kit (JDK) 17+

### Development
```bash
# Build and sync web assets to mobile
npm run build:mobile

# Open in Android Studio
npm run android:open

# Open in Xcode (macOS only)
npm run ios:open

# Run on Android device/emulator
npm run android:run

# Run on iOS device/simulator
npm run ios:run
```

### Building Mobile Apps

#### Android Build
```bash
# 1. Prepare build
npm run build:mobile

# 2. Open Android Studio
npm run android:open

# 3. In Android Studio:
# - Build > Generate Signed Bundle/APK
# - Choose APK or AAB (Android App Bundle)
# - Sign with your keystore
```

#### iOS Build
```bash
# 1. Prepare build  
npm run build:mobile

# 2. Open Xcode
npm run ios:open

# 3. In Xcode:
# - Product > Archive
# - Upload to App Store or export IPA
# - Requires Apple Developer account
```

### Mobile App Features
- ✅ **Native Performance**: Full native app experience
- ✅ **Device APIs**: Camera, notifications, file system access
- ✅ **App Store Ready**: Deployable to Google Play & Apple App Store
- ✅ **Offline Support**: Works without internet connection
- ✅ **Native Navigation**: Platform-specific UI patterns
- ✅ **Push Notifications**: Native notification support

### App Store Deployment

#### Google Play Store
1. Build signed APK/AAB in Android Studio
2. Create Google Play Console account
3. Upload APK/AAB and complete store listing
4. Submit for review

#### Apple App Store  
1. Build and archive in Xcode
2. Upload via App Store Connect
3. Complete app metadata and screenshots
4. Submit for Apple review

## 🖥️ Desktop Version (Electron)

### Development
```bash
# Start desktop app in development
npm run start:desktop
# or
npm run electron:dev

# This will:
# 1. Start Vite dev server
# 2. Wait for it to be ready
# 3. Launch Electron pointing to dev server
```

### Building Desktop Apps

#### Build for Current Platform
```bash
# Build for your current OS
npm run package:desktop

# Files will be in ./release directory
```

#### Build for All Platforms
```bash
# Build for Windows, Mac, and Linux
npm run package:all

# Individual platform builds:
npx electron-builder --win    # Windows (.exe, .msi)
npx electron-builder --mac    # macOS (.dmg, .app)
npx electron-builder --linux  # Linux (.AppImage, .deb, .snap)
```

### Distribution Files

| Platform | File Types | Notes |
|----------|------------|-------|
| **Windows** | `.exe` (installer), `.exe` (portable) | NSIS installer with auto-updater |
| **macOS** | `.dmg` (disk image) | Supports both Intel and Apple Silicon |
| **Linux** | `.AppImage`, `.deb`, `.snap` | Universal compatibility |

### Desktop Features
- ✅ **Native Menus**: File, Edit, View, AI Models, Help
- ✅ **Auto Updates**: Built-in updater checks for new versions
- ✅ **System Integration**: Native notifications, file associations
- ✅ **Offline First**: Works without internet connection
- ✅ **Performance**: Native app performance
- ✅ **Security**: Sandboxed with secure preload scripts

## 🔧 Configuration

### PWA Manifest (Auto-generated)
```json
{
  "name": "Yumi Series - AI Platform",
  "short_name": "Yumi",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#7c3aed",
  "background_color": "#ffffff"
}
```

### Electron Builder Config
Located in `package.json` under `"build"` section:
- **App ID**: `com.yumiai.yumiseries`
- **Auto-updater**: GitHub releases
- **Code signing**: Disabled (enable for production)
- **Multi-platform**: Windows, Mac, Linux

## 🚀 Deployment Strategies

### Strategy 1: Multi-Platform Release (Recommended)
```bash
# 1. Build web version
npm run build:web

# 2. Deploy web to hosting platform
# Upload ./dist to Netlify/Vercel

# 3. Build mobile apps
npm run build:mobile
# Then build in Android Studio & Xcode

# 4. Build desktop versions
npm run package:all

# 5. Create GitHub release
# Upload all files from ./release to GitHub releases

# 6. Submit to app stores
# Upload APK/AAB to Google Play
# Upload IPA to App Store Connect
```

### Strategy 2: Automated CI/CD
```yaml
# .github/workflows/build.yml
name: Build and Deploy
on:
  push:
    tags: ['v*']

jobs:
  web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build:web
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=dist

  desktop:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run package:desktop
      - uses: softprops/action-gh-release@v1
        with:
          files: release/*
```

## 📱 Platform-Specific Features

### Web/PWA
```typescript
import { isWeb, isPWA } from './utils/platform';

if (isPWA()) {
  // Show PWA-specific UI
  console.log('Running as PWA');
}
```

### Mobile Apps
```typescript
import { isMobileApp, isAndroid, isIOS, mobileUtils } from './utils/platform';

if (isMobileApp()) {
  // Enable mobile-specific features
  mobileUtils.showNotification('Welcome', 'Yumi Series mobile app is ready!');
  
  if (isAndroid()) {
    // Android-specific functionality
    console.log('Running on Android');
  }
  
  if (isIOS()) {
    // iOS-specific functionality  
    console.log('Running on iOS');
  }
}
```

### Desktop
```typescript
import { isDesktop, desktopUtils } from './utils/platform';

if (isDesktop()) {
  // Enable desktop features
  desktopUtils.showNotification('Welcome', 'Yumi Series is ready!');
}
```

## 🔍 Testing

### Web Testing
```bash
# Test PWA features
npm run build:web
npm run preview

# Check in Chrome DevTools > Application > Service Workers
# Verify install prompt appears
```

### Mobile Testing
```bash
# Test mobile build sync
npm run build:mobile

# Test on Android emulator
npm run android:run

# Test on iOS simulator (macOS only)
npm run ios:run

# Debug in Chrome DevTools
# For Android: chrome://inspect
# For iOS: Use Safari Web Inspector
```

### Desktop Testing
```bash
# Test desktop app
npm run start:desktop

# Test production build
npm run package:desktop
./release/Yumi\ Series-1.0.0.exe  # Windows
./release/Yumi\ Series-1.0.0.dmg  # macOS
```

## 📊 Performance Optimization

### Web Optimizations
- **Code Splitting**: Vite automatically splits bundles
- **Service Worker**: Caches resources for offline use
- **Lazy Loading**: Components load on demand
- **PWA Caching**: API responses cached for speed

### Desktop Optimizations
- **Preload Scripts**: Secure, fast main-renderer communication
- **Menu Integration**: Native keyboard shortcuts
- **Auto-updater**: Background updates without user intervention
- **Resource Bundling**: All assets bundled in executable

## 🐛 Troubleshooting

### Common Issues

#### PWA Not Installing
- Check HTTPS requirement
- Verify manifest.json is valid
- Ensure service worker is registered

#### Electron Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules release dist
npm install
npm run package:desktop
```

#### Auto-updater Not Working
- Verify GitHub release settings
- Check `publish` config in package.json
- Ensure proper versioning (semver)

## 📈 Analytics & Monitoring

### Web Analytics
```javascript
// Add to your React app
if (isPWA()) {
  gtag('event', 'pwa_install');
}
```

### Desktop Telemetry
```javascript
// Track desktop usage
if (isDesktop()) {
  analytics.track('desktop_launch', {
    platform: getPlatform(),
    version: app.getVersion()
  });
}
```

## 🔐 Security Considerations

### Web Security
- ✅ HTTPS required for PWA
- ✅ CSP headers recommended
- ✅ Secure cookie settings

### Desktop Security
- ✅ Context isolation enabled
- ✅ Node integration disabled
- ✅ Secure preload scripts
- ✅ External link handling

## 📚 Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Electron Builder](https://www.electron.build/)

---

**Ready to ship web, mobile, and desktop from one codebase! 🚀📱💻** 