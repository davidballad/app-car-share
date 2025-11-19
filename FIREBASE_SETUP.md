# 🔥 Firebase Setup Guide - 100% FREE!

## Total Cost: $25 (Google Play Store fee only!)

Firebase is **completely FREE** for your app size and will stay free forever! ✅

---

## Why Firebase?

- ✅ **FREE Forever** (not just a trial)
- ✅ **No Credit Card** required
- ✅ **No Time Limits** (unlike Render's 90 days)
- ✅ **Generous Free Tier**:
  - 1GB Firestore storage
  - 50K reads/day, 20K writes/day
  - 50K authenticated users
  - 10GB hosting storage
  - 360MB/day bandwidth

Perfect for Ecuador Rideshare! 🇪🇨

---

## Step 1: Create Firebase Project (5 minutes)

### 1.1 Go to Firebase Console
Visit: https://console.firebase.google.com

### 1.2 Create New Project
1. Click "Add project"
2. **Project name**: `ecuador-rideshare`
3. Click "Continue"
4. **Google Analytics**: Enable (recommended)
5. Click "Create project"
6. Wait 30 seconds... Done! ✅

---

## Step 2: Set Up Firebase Services

### 2.1 Enable Authentication

1. In Firebase Console, click "Authentication"
2. Click "Get started"
3. Enable these sign-in methods:
   - ✅ **Email/Password** (click Enable → Save)
   - ✅ **Phone** (for Ecuador phone verification)
   - ✅ **Google** (click Enable → Save)
   - ✅ **Facebook** (requires Facebook App ID - see Step 2.1.1 below)

#### 2.1.1 Configure Google Sign-In

1. In Authentication → Sign-in method → Google
2. Click "Enable"
3. Set support email (your email)
4. Click "Save"
5. **Copy the Web Client ID** - you'll need this for mobile apps

#### 2.1.2 Configure Facebook Login

**Step A: Create Facebook App**
1. Go to https://developers.facebook.com
2. Click "My Apps" → "Create App"
3. Choose "Consumer" app type
4. **App Name**: "Ecuador Rideshare"
5. **App Contact Email**: your email
6. Click "Create App"

**Step B: Add Facebook Login**
1. In your Facebook App dashboard, click "Add Product"
2. Find "Facebook Login" and click "Set Up"
3. Choose "iOS" and "Android" platforms
4. Follow the setup wizard

**Step C: Get App Credentials**
1. Go to Settings → Basic
2. Copy your **App ID**
3. Copy your **App Secret**

**Step D: Configure in Firebase**
1. Back in Firebase Console → Authentication → Sign-in method
2. Click "Facebook"
3. Click "Enable"
4. Paste your Facebook **App ID**
5. Paste your Facebook **App Secret**
6. Copy the **OAuth redirect URI** shown
7. Click "Save"

**Step E: Add OAuth Redirect to Facebook**
1. Back in Facebook App → Facebook Login → Settings
2. In "Valid OAuth Redirect URIs", paste the URI from Firebase
3. Click "Save Changes"

**Step F: Make App Live**
1. In Facebook App dashboard, toggle "App Mode" to "Live"
2. Your app is now ready for Facebook Login!

### 2.2 Create Firestore Database

1. Click "Firestore Database" in sidebar
2. Click "Create database"
3. **Location**: `us-east1` (closest to Ecuador)
4. **Security rules**: Start in **production mode**
5. Click "Enable"

### 2.3 Enable Storage

1. Click "Storage" in sidebar
2. Click "Get started"
3. Use default security rules
4. **Location**: `us-east1`
5. Click "Done"

---

## Step 3: Get Firebase Config

### 3.1 Add Web App

1. In Project Overview, click the **Web icon** (</>)
2. **App nickname**: `Ecuador Rideshare Web`
3. ✅ Check "Also set up Firebase Hosting"
4. Click "Register app"

### 3.2 Copy Configuration

You'll see something like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "ecuador-rideshare.firebaseapp.com",
  projectId: "ecuador-rideshare",
  storageBucket: "ecuador-rideshare.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

**SAVE THIS!** You'll need it in Step 4.

### 3.3 Add Android App (for Mobile)

1. Click "Add app" → Android icon
2. **Android package name**: `com.ecuadorrideshare.app`
3. Click "Register app"
4. Download `google-services.json`
5. Save it for later

---

## Step 4: Configure Your Apps

### 4.1 Update Mobile App Config

Replace the config in `mobile/src/services/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "ecuador-rideshare.firebaseapp.com",
  projectId: "ecuador-rideshare",
  storageBucket: "ecuador-rideshare.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4.2 Install Firebase in Mobile App

```bash
cd mobile
npm install firebase
```

### 4.3 Add google-services.json

Place the downloaded `google-services.json` in:
```
mobile/android/app/google-services.json
```

### 4.4 Update Web App Config

Create `web/src/services/firebase.ts` with the same config.

### 4.5 Install Firebase in Web App

```bash
cd web
npm install firebase
```

---

## Step 5: Deploy Security Rules

### 5.1 Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 5.2 Login to Firebase

```bash
firebase login
```

### 5.3 Initialize Firebase

```bash
# In your project root
firebase init
```

Select:
- ✅ Firestore
- ✅ Hosting
- ✅ Storage

Use existing project: `ecuador-rideshare`

### 5.4 Deploy Rules

```bash
firebase deploy --only firestore:rules
```

---

## Step 6: Test Everything

### 6.1 Test Mobile App Locally

```bash
cd mobile
npx expo start
```

Test:
- ✅ Register new user
- ✅ Login
- ✅ Search trips
- ✅ Create booking

### 6.2 Check Firebase Console

Go to Firebase Console → Firestore Database

You should see:
- `users` collection with your test user
- `trips` collection (if you created any)
- `bookings` collection (if you made bookings)

---

## Step 7: Deploy Web App (Optional, FREE!)

### 7.1 Build Web App

```bash
cd web
npm run build
```

### 7.2 Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

Your web app will be live at:
```
https://ecuador-rideshare.web.app
```

**100% FREE!** ✅

---

## Step 8: Build for Google Play Store

Now your app is ready with Firebase backend!

```bash
cd mobile
npm install -g eas-cli
eas build --platform android
```

---

## 📊 Firebase Free Tier Limits

Perfect for starting your Ecuador Rideshare app:

| Service | Free Tier | Enough For |
|---------|-----------|------------|
| **Firestore** | 50K reads/day | ~1,600 users/day |
| **Firestore** | 20K writes/day | ~600 bookings/day |
| **Storage** | 1GB | ~10,000 profile photos |
| **Auth** | 50K users | 50,000 registered users |
| **Hosting** | 10GB/month | ~300K page views |

### When You Grow:
- First 1,000 users: **FREE** ✅
- 10,000 users: ~$25/month
- 100,000 users: ~$200/month

Start free, pay only when successful! 💰

---

## 🔐 Security Best Practices

### Update Firestore Rules

The `firestore.rules` file is already configured with:
- ✅ Users can only edit their own data
- ✅ Anyone can search trips
- ✅ Only trip owners can modify trips
- ✅ Admins have full access

### Enable App Check (Recommended)

1. Go to Firebase Console → App Check
2. Enable for your apps
3. Prevents abuse and unauthorized access

---

## 🚀 Deployment Checklist

Before going live:

- [ ] Firebase project created
- [ ] Authentication enabled (Email + Phone)
- [ ] Firestore database created
- [ ] Storage enabled
- [ ] Firebase config added to mobile app
- [ ] Firebase config added to web app
- [ ] Security rules deployed
- [ ] Tested registration/login
- [ ] Tested trip search
- [ ] Tested bookings
- [ ] Built Android APK
- [ ] Submitted to Play Store

---

## 💡 Firebase vs Render Comparison

| Feature | Firebase | Render |
|---------|----------|--------|
| **Cost** | FREE forever | FREE for 90 days |
| **Database** | Firestore (NoSQL) | PostgreSQL (SQL) |
| **Setup** | 10 minutes | 5 minutes |
| **Scalability** | Auto-scales | Manual scaling |
| **Auth** | Built-in | DIY |
| **Storage** | Built-in | Separate service |
| **Best For** | Mobile apps | Web APIs |

**Recommendation**: Use Firebase! It's designed for mobile apps and stays free longer. ✅

---

## 🆘 Troubleshooting

### "Permission denied" errors?
- Check Firestore rules are deployed
- Ensure user is authenticated
- Verify user has correct permissions

### Can't connect to Firebase?
- Check `firebaseConfig` is correct
- Ensure Firebase SDK is installed
- Check internet connection

### Quota exceeded?
- Check Firebase Console → Usage
- Free tier is very generous
- Upgrade only if needed

---

## 📱 Next Steps

1. **Complete Firebase setup** (Steps 1-5)
2. **Test locally** (Step 6)
3. **Build Android app** (Step 8)
4. **Submit to Play Store**

---

## 💰 Final Cost Summary

| Item | Cost |
|------|------|
| Firebase (database, auth, hosting) | **$0/month** |
| Google Play Store fee | **$25 one-time** |
| **TOTAL** | **$25** |

That's it! Your entire Ecuador Rideshare platform for just $25! 🎉

---

## 🔗 Useful Links

- Firebase Console: https://console.firebase.google.com
- Firebase Docs: https://firebase.google.com/docs
- Firestore Pricing: https://firebase.google.com/pricing
- Firebase Status: https://status.firebase.google.com

---

**Ready to deploy?** Follow Steps 1-8 above! 🚀

Questions? Check the troubleshooting section or Firebase docs.

Good luck with Ecuador Rideshare! 🇪🇨🔥