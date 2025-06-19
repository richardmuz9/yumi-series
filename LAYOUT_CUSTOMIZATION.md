# 🎨 Layout Customization Guide

## Overview
Yumi Series now includes a powerful **Layout & Theme Customizer** that allows users to fully personalize their workspace experience. Users can drag, resize, show/hide panels, customize backgrounds, and save their preferred layouts.

## Features

### 🛠️ Layout Editor
- **Drag & Drop**: Move panels anywhere on the grid
- **Resize**: Adjust panel sizes by dragging corners
- **Live Preview**: See changes in real-time
- **Smart Grid**: Automatic alignment and collision detection

### 👁️ Panel Management  
- **Show/Hide Panels**: Toggle visibility of different sections
- **Panel Types**:
  - **Modes Grid**: Main application modes
  - **Charge Panel**: Token management
  - **Header**: Title and navigation  
  - **Footer**: Status information

### 🌈 Background Themes
- **8 Beautiful Options**:
  - Default Yumi (Original character background)
  - Purple Dream (Gradient)
  - Ocean Sunset (Warm gradient)
  - Aurora (Cool gradient)
  - Midnight (Dark gradient)
  - Cosmic (Multi-color gradient)
  - Deep Navy (Solid color)
  - Forest (Solid color)

### 💾 Persistence & Sharing
- **Auto-Save**: Settings saved to localStorage automatically
- **Export Layout**: Download custom configuration as JSON
- **Import Layout**: Load saved configurations
- **Reset**: Return to default layout anytime

## How to Use

### Access the Customizer
1. Click the **Settings** button (⚙️) in the top-right corner
2. Select **🎨 Customize Layout & Theme**
3. The customizer modal will open

### Edit Mode
1. Click **✏️ Edit Layout** to enable editing
2. **Drag panels** to move them around
3. **Resize panels** by dragging the corner handles
4. Click **✅ Exit Editor** when finished

### Panel Visibility
- Use the checkboxes to show/hide different panels
- Changes apply immediately to the preview

### Background Themes
- Click on any background preview to apply it
- Changes are applied instantly to the main page

### Save & Share
- **🔄 Reset**: Restore default layout
- **📤 Export**: Download your layout as `yumi-layout.json`
- **📥 Import**: Upload a previously saved layout file

## Multi-Language Support
The Layout Customizer is fully translated in:
- 🇺🇸 **English**
- 🇨🇳 **中文 (Chinese)**
- 🇯🇵 **日本語 (Japanese)**  
- 🇰🇷 **한국어 (Korean)**

## API Integration - Alipay Payment System
The billing system now includes full **Alipay SDK** integration:

```javascript
// Backend implementation
const alipaySdk = new AlipaySdk({
  appId: process.env.ALIPAY_APP_ID,
  privateKey: process.env.ALIPAY_PRIVATE_KEY,
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
  gateway: 'https://openapi.alipaydev.com/gateway.do'
});

// Generate payment URL
const paymentUrl = await alipaySdk.exec('alipay.trade.page.pay', {
  bizContent: {
    out_trade_no: orderId,
    product_code: 'FAST_INSTANT_TRADE_PAY',
    total_amount: '0.01',
    subject: 'Token Purchase'
  }
});
```

## File Structure
```
frontend/src/
├── components/
│   ├── LayoutCustomizer.tsx    # Main customizer component
│   └── LayoutCustomizer.css    # Customizer styles
├── MainPage.tsx                # Updated with customizer integration
└── main.css                    # Additional layout styles

backend/src/modules/
└── billing.ts                  # Updated with Alipay SDK
```

---

**Enjoy customizing your Yumi Series workspace! 🎨✨** 