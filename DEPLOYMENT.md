# 🚀 Free Deployment Guide - Ecuador Rideshare

## Total Cost: $25 (Google Play Store fee only!)

Everything else is **100% FREE** ✅

---

## Step 1: Deploy Backend (FREE on Render.com)

### 1.1 Create GitHub Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ecuador Rideshare - Initial deployment"

# Create repo on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/ecuador-rideshare.git
git branch -M main
git push -u origin main
```

### 1.2 Deploy to Render.com (No Credit Card Needed!)

1. **Sign up**: Go to https://render.com
2. **Connect GitHub**: Link your GitHub account
3. **New Blueprint**: 
   - Click "New +" → "Blueprint"
   - Select your `ecuador-rideshare` repository
   - Render will detect `render.yaml` automatically
4. **Deploy**: Click "Apply"
5. **Wait**: 5-10 minutes for deployment
6. **Get URL**: Your API will be at `https://ecuador-rideshare-api.onrender.com`

### 1.3 Note Your API URL

Save this URL - you'll need it for the mobile app!

```
API_URL: https://ecuador-rideshare-api.onrender.com
```

---

## Step 2: Update Mobile App with API URL

### 2.1 Create Config File

```bash
cd mobile
```

Create `mobile/src/config.ts`:

```typescript
export const API_URL = 'https://ecuador-rideshare-api.onrender.com';
export const APP_VERSION = '1.0.0';
```

### 2.2 Update API Calls

Update all API calls to use `API_URL` from config.

---

## Step 3: Test Everything Locally

### 3.1 Test Backend

```bash
# Your backend is live!
curl https://ecuador-rideshare-api.onrender.com/health
```

### 3.2 Test Mobile App

```bash
cd mobile
npx expo start
```

Test:
- ✅ Login/Register
- ✅ Search trips
- ✅ View profile
- ✅ All features work with live backend

---

## Step 4: Build for Google Play Store

### 4.1 Install EAS CLI

```bash
npm install -g eas-cli
```

### 4.2 Configure EAS

```bash
cd mobile
eas login
eas build:configure
```

### 4.3 Update app.json

```json
{
  "expo": {
    "name": "Ecuador Rideshare",
    "slug": "ecuador-rideshare",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#2E86AB"
    },
    "android": {
      "package": "com.ecuadorrideshare.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/icon.png",
        "backgroundColor": "#2E86AB"
      },
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

### 4.4 Build APK/AAB

```bash
# Build for Google Play Store
eas build --platform android --profile production
```

This will:
- Build your app in the cloud (FREE with Expo)
- Generate signed AAB file
- Provide download link

---

## Step 5: Submit to Google Play Store

### 5.1 Create Google Play Developer Account

1. Go to: https://play.google.com/console
2. Pay $25 one-time registration fee
3. Complete account setup

### 5.2 Create New App

1. Click "Create app"
2. Fill in details:
   - **App name**: Ecuador Rideshare
   - **Default language**: Spanish (Ecuador)
   - **App type**: App
   - **Free or paid**: Free

### 5.3 Store Listing (in Spanish!)

**App name**: Ecuador Rideshare

**Short description**:
```
Viaja seguro por Ecuador. Conecta con conductores verificados.
```

**Full description**:
```
Ecuador Rideshare es la plataforma más segura para compartir viajes en Ecuador.

🚗 Características:
• Conductores verificados con antecedentes penales
• Cobertura en Quito, Guayaquil, Cuenca y más
• Precios justos y transparentes
• Comunicación directa por WhatsApp
• Sistema de calificaciones

🛡️ Seguridad:
• Verificación de cédula ecuatoriana
• Revisión de antecedentes
• Calificaciones de usuarios
• Soporte 24/7

💰 Económico:
• Sin comisiones ocultas
• Pago en efectivo o transferencia
• Comparte gastos de viaje

Únete a miles de ecuatorianos que ya viajan de forma segura y económica.
```

**Category**: Maps & Navigation

**Email**: your@email.com

### 5.4 Upload Assets

You need:
- **App icon**: 512x512px PNG
- **Feature graphic**: 1024x500px
- **Screenshots**: At least 2 (phone screenshots)

### 5.5 Upload APK/AAB

1. Go to "Production" → "Create new release"
2. Upload the AAB file from EAS build
3. Add release notes in Spanish:
   ```
   Primera versión de Ecuador Rideshare
   - Búsqueda de viajes
   - Registro y verificación
   - Sistema de reservas
   - Comunicación por WhatsApp
   ```

### 5.6 Content Rating

Complete the questionnaire (select appropriate ratings)

### 5.7 Privacy Policy

You need a privacy policy URL. Create a simple one:

```markdown
# Política de Privacidad - Ecuador Rideshare

Última actualización: [Fecha]

## Información que recopilamos
- Nombre y apellido
- Número de teléfono
- Correo electrónico
- Ubicación (solo durante uso de la app)

## Uso de la información
- Conectar conductores y pasajeros
- Verificación de identidad
- Mejorar el servicio

## Seguridad
Tus datos están protegidos y encriptados.

## Contacto
Email: support@ecuadorrideshare.com
```

Host this on GitHub Pages (free) or in your web app.

### 5.8 Submit for Review

1. Review all sections (must be complete)
2. Click "Submit for review"
3. Wait 1-7 days for approval

---

## 🎉 You're Live!

Once approved:
- ✅ App on Google Play Store
- ✅ Backend running on Render (free)
- ✅ Database on Render (free)
- ✅ Total cost: $25 (one-time)

---

## 📊 Free Tier Limits

### Render.com Free Tier:
- ✅ 750 hours/month (enough for 24/7)
- ✅ Sleeps after 15 min inactivity (wakes on request)
- ✅ 100GB bandwidth/month
- ✅ PostgreSQL database (90 days, renewable)

### Expo EAS Free Tier:
- ✅ Unlimited builds
- ✅ Cloud building
- ✅ OTA updates

---

## 🔄 Updates

To update your app:

```bash
# Update code
git add .
git commit -m "Update: new features"
git push

# Render auto-deploys backend

# Build new mobile version
cd mobile
eas build --platform android

# Upload to Play Store
```

---

## 💡 Tips

1. **First deployment takes time** - Be patient!
2. **Test thoroughly** before Play Store submission
3. **Respond to reviews** in Spanish
4. **Monitor Render dashboard** for backend health
5. **Keep app updated** regularly

---

## 🆘 Troubleshooting

### Backend not responding?
- Check Render dashboard
- Free tier sleeps after 15 min - first request wakes it (30 sec delay)

### Build failed?
- Check `eas build` logs
- Ensure all dependencies are installed

### Play Store rejection?
- Read rejection reason carefully
- Fix issues and resubmit
- Common: missing privacy policy, inappropriate content rating

---

## 📞 Support

Need help? Check:
- Render docs: https://render.com/docs
- Expo docs: https://docs.expo.dev
- Play Console help: https://support.google.com/googleplay

---

**Total Investment**: $25 💰
**Monthly Cost**: $0 🎉
**Time to Deploy**: 2-3 hours ⏱️

Good luck with your Ecuador Rideshare app! 🇪🇨🚗