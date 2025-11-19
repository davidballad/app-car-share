# 🚀 Social Authentication Quick Start Guide

## What's New?

Your Ecuador Rideshare app now supports **Google and Facebook login** across all platforms! 🎉

## Quick Setup (5 Steps)

### Step 1: Enable in Firebase Console (5 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your `ecuador-rideshare` project
3. Click **Authentication** → **Sign-in method**
4. Enable **Google** (just click Enable → Save)
5. Enable **Facebook** (requires Facebook App - see below)

### Step 2: Create Facebook App (10 minutes)

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Click **My Apps** → **Create App** → **Consumer**
3. Name: "Ecuador Rideshare"
4. Add **Facebook Login** product
5. Copy **App ID** and **App Secret**
6. Paste into Firebase Console → Authentication → Facebook
7. Copy OAuth redirect URI from Firebase back to Facebook
8. Make app **Live** (toggle in Facebook dashboard)

### Step 3: Install Dependencies

**Mobile:**
```bash
cd mobile
npm install @react-native-google-signin/google-signin react-native-fbsdk-next
cd ios && pod install && cd ..
```

**Web:**
```bash
cd web
npm install firebase
```

### Step 4: Update Firebase Config

**Mobile** (`mobile/src/services/firebase.ts`):
```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_FROM_FIREBASE",
  authDomain: "ecuador-rideshare.firebaseapp.com",
  projectId: "ecuador-rideshare",
  storageBucket: "ecuador-rideshare.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Also update:
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID_FROM_FIREBASE',
  // ...
});
```

**Web** (`web/src/services/firebase.ts`):
```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_FROM_FIREBASE",
  authDomain: "ecuador-rideshare.firebaseapp.com",
  projectId: "ecuador-rideshare",
  storageBucket: "ecuador-rideshare.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 5: Configure Native Apps (Mobile Only)

**iOS** (`mobile/ios/YourApp/Info.plist`):
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>YOUR_REVERSED_CLIENT_ID</string>
      <string>fbYOUR_FACEBOOK_APP_ID</string>
    </array>
  </dict>
</array>
<key>FacebookAppID</key>
<string>YOUR_FACEBOOK_APP_ID</string>
```

**Android** (`mobile/android/app/src/main/res/values/strings.xml`):
```xml
<string name="facebook_app_id">YOUR_FACEBOOK_APP_ID</string>
<string name="fb_login_protocol_scheme">fbYOUR_FACEBOOK_APP_ID</string>
```

## Test It!

### Mobile:
```bash
cd mobile
npx react-native run-android
# or
npx react-native run-ios
```

1. Open the app
2. Go to Login screen
3. Tap "Continuar con Google" or "Continuar con Facebook"
4. Sign in with your account
5. ✅ You're logged in!

### Web:
```bash
cd web
npm start
```

1. Open http://localhost:3000
2. Go to Login page
3. Click "Continuar con Google" or "Continuar con Facebook"
4. Sign in with your account
5. ✅ You're logged in!

## What Users See

### Login Screen (Before)
- Email input
- Password input
- "Iniciar Sesión" button
- "Regístrate aquí" link

### Login Screen (After)
- Email input
- Password input
- "Iniciar Sesión" button
- **"O continúa con"** divider
- **"Continuar con Google"** button (red)
- **"Continuar con Facebook"** button (blue)
- "Regístrate aquí" link

## How It Works

1. User clicks social login button
2. Popup/redirect to Google/Facebook
3. User approves access
4. Firebase creates/authenticates user
5. App creates user profile in Firestore (if new)
6. User is logged in! 🎉

## Troubleshooting

### "DEVELOPER_ERROR" (Google)
- ❌ Web Client ID is wrong
- ✅ Copy correct Web Client ID from Firebase Console

### "App not setup" (Facebook)
- ❌ Facebook App ID is wrong
- ✅ Check Facebook App ID in Facebook Developer Console

### "Popup blocked" (Web)
- ❌ Browser blocked the popup
- ✅ Allow popups for your site

### "Sign-in cancelled"
- ❌ User closed the popup
- ✅ This is normal, just try again

## Need More Help?

📖 **Detailed Guides:**
- `FIREBASE_SETUP.md` - Complete Firebase setup
- `mobile/SOCIAL_AUTH_SETUP.md` - Mobile-specific setup
- `.kiro/specs/ecuador-rideshare/SOCIAL_AUTH_IMPLEMENTATION.md` - Technical details

🔗 **Official Docs:**
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Google Sign-In](https://github.com/react-native-google-signin/google-signin)
- [Facebook Login](https://github.com/thebergamo/react-native-fbsdk-next)

## Summary

✅ **Spec documents updated** (requirements, design, tasks)
✅ **Firebase configuration created** (mobile & web)
✅ **Authentication services implemented**
✅ **UI updated** (login screens with social buttons)
✅ **AuthContext updated** (social login methods)
✅ **Documentation created** (setup guides)

**Next:** Follow the 5 steps above to enable social authentication! 🚀
