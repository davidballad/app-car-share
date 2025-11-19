# Social Authentication Setup Guide

## Required Dependencies

### 1. Install Google Sign-In for React Native

```bash
cd mobile
npm install @react-native-google-signin/google-signin
```

### 2. Install Facebook SDK for React Native

```bash
npm install react-native-fbsdk-next
```

### 3. Install Firebase (if not already installed)

```bash
npm install firebase
```

## iOS Configuration

### Google Sign-In iOS Setup

1. **Add URL Scheme to Info.plist**:
   - Open `mobile/ios/YourApp/Info.plist`
   - Add the following (replace with your REVERSED_CLIENT_ID from GoogleService-Info.plist):

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>YOUR_REVERSED_CLIENT_ID</string>
    </array>
  </dict>
</array>
```

2. **Install Pods**:
```bash
cd ios
pod install
cd ..
```

### Facebook Login iOS Setup

1. **Add to Info.plist**:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>fbYOUR_APP_ID</string>
    </array>
  </dict>
</array>
<key>FacebookAppID</key>
<string>YOUR_APP_ID</string>
<key>FacebookDisplayName</key>
<string>Ecuador Rideshare</string>
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>fbapi</string>
  <string>fb-messenger-share-api</string>
</array>
```

2. **Install Pods**:
```bash
cd ios
pod install
cd ..
```

## Android Configuration

### Google Sign-In Android Setup

1. **Add to android/build.gradle**:

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

2. **Add to android/app/build.gradle**:

```gradle
apply plugin: 'com.google.gms.google-services'

dependencies {
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
}
```

3. **Download google-services.json**:
   - Get from Firebase Console
   - Place in `mobile/android/app/google-services.json`

### Facebook Login Android Setup

1. **Add to android/app/src/main/res/values/strings.xml**:

```xml
<string name="facebook_app_id">YOUR_APP_ID</string>
<string name="fb_login_protocol_scheme">fbYOUR_APP_ID</string>
<string name="facebook_client_token">YOUR_CLIENT_TOKEN</string>
```

2. **Add to android/app/src/main/AndroidManifest.xml**:

```xml
<application>
    <meta-data
        android:name="com.facebook.sdk.ApplicationId"
        android:value="@string/facebook_app_id"/>
    
    <meta-data
        android:name="com.facebook.sdk.ClientToken"
        android:value="@string/facebook_client_token"/>
    
    <activity
        android:name="com.facebook.FacebookActivity"
        android:configChanges="keyboard|keyboardHidden|screenLayout|screenSize|orientation"
        android:label="@string/app_name" />
    
    <activity
        android:name="com.facebook.CustomTabActivity"
        android:exported="true">
        <intent-filter>
            <action android:name="android.intent.action.VIEW" />
            <category android:name="android.intent.category.DEFAULT" />
            <category android:name="android.intent.category.BROWSABLE" />
            <data android:scheme="@string/fb_login_protocol_scheme" />
        </intent-filter>
    </activity>
</application>
```

## Firebase Configuration

### Update mobile/src/services/firebase.ts

Replace the placeholder values with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "ecuador-rideshare.firebaseapp.com",
  projectId: "ecuador-rideshare",
  storageBucket: "ecuador-rideshare.appspot.com",
  messagingSenderId: "YOUR_ACTUAL_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

And update the Google Sign-In web client ID:

```typescript
GoogleSignin.configure({
  webClientId: 'YOUR_ACTUAL_WEB_CLIENT_ID', // From Firebase Console
  offlineAccess: true,
  hostedDomain: '',
  forceCodeForRefreshToken: true,
});
```

## Testing

### Test Google Sign-In

1. Run the app: `npx expo start` or `npx react-native run-android`
2. Navigate to Login screen
3. Tap "Continuar con Google"
4. Select a Google account
5. Verify successful login

### Test Facebook Login

1. Run the app
2. Navigate to Login screen
3. Tap "Continuar con Facebook"
4. Log in with Facebook credentials
5. Verify successful login

## Troubleshooting

### Google Sign-In Issues

- **Error: DEVELOPER_ERROR**: Web Client ID is incorrect or not configured
- **Error: SIGN_IN_CANCELLED**: User cancelled the sign-in
- **Error: SIGN_IN_REQUIRED**: User needs to sign in again

### Facebook Login Issues

- **Error: App not setup**: Facebook App ID is incorrect
- **Error: Invalid key hash**: Add your key hash to Facebook Developer Console
- **Error: User cancelled**: User closed the login dialog

## Next Steps

1. Enable Google and Facebook authentication in Firebase Console (see FIREBASE_SETUP.md)
2. Configure OAuth credentials
3. Test on both iOS and Android devices
4. Add error handling and user feedback
5. Implement account linking for existing users
