# 🇪🇨 Ecuador Rideshare Platform

A complete rideshare platform designed specifically for Ecuador, featuring mobile apps, web interface, and admin dashboard.

## 🚀 Features

- **Mobile App** (React Native/Expo)
  - Trip search with Ecuador cities
  - User authentication with Ecuador phone validation
  - Cedula verification
  - WhatsApp integration
  - Spanish localization

- **Web Application** (React)
  - Responsive design
  - Trip search and booking
  - User profiles
  - Ecuador-themed UI

- **Admin Dashboard** (React)
  - User management
  - Verification approval workflow
  - Trip monitoring
  - System analytics

- **Backend API** (Node.js/Express)
  - RESTful API
  - PostgreSQL database
  - JWT authentication
  - Ecuador-specific validations

## 📱 Free Deployment (No Cost!)

### Deploy Backend to Render.com (FREE)

1. **Create Render Account**: https://render.com (no credit card needed)

2. **Connect GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO
   git push -u origin main
   ```

3. **Deploy on Render**:
   - Go to Render Dashboard
   - Click "New +" → "Blueprint"
   - Connect your GitHub repo
   - Render will auto-detect `render.yaml`
   - Click "Apply"
   - Your API will be live at: `https://ecuador-rideshare-api.onrender.com`

### Alternative Free Options:

#### **Railway.app** (500 hours/month free)
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

#### **Fly.io** (Free tier available)
```bash
npm install -g flyctl
fly auth signup
fly launch
fly deploy
```

## 🗄️ Database Setup

Your PostgreSQL database is automatically created with Render.com (free tier).

**Connection String** will be available in Render dashboard as `DATABASE_URL`.

## 📦 Local Development

### Backend
```bash
cd backend
npm install
npm run dev
```

### Web App
```bash
cd web
npm install
npm start
```

### Admin Dashboard
```bash
cd admin
npm install
npm start
```

### Mobile App
```bash
cd mobile
npm install
npx expo start
```

## 🌍 Ecuador-Specific Features

- ✅ Spanish language interface
- ✅ Ecuador cities database (Quito, Guayaquil, Cuenca, etc.)
- ✅ Cedula validation with official algorithm
- ✅ Ecuador phone format (09XXXXXXXX)
- ✅ WhatsApp integration (+593)
- ✅ Ecuador timezone support
- ✅ USD currency formatting

## 📱 Google Play Store Deployment

1. **Build APK**:
   ```bash
   cd mobile
   eas build --platform android
   ```

2. **Submit to Play Store**:
   - Create Google Play Developer account ($25 one-time)
   - Upload APK/AAB
   - Fill store listing in Spanish
   - Submit for review

## 🔐 Environment Variables

Create `.env` file in backend:
```env
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_secret_key
PORT=3000
NODE_ENV=production
```

## 📊 Tech Stack

- **Frontend**: React, React Native, TypeScript
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Deployment**: Render.com (free)
- **Mobile**: Expo

## 💰 Cost Breakdown

- **Development**: $0 (all free tools)
- **Hosting**: $0 (Render.com free tier)
- **Database**: $0 (Render.com free PostgreSQL)
- **Google Play**: $25 (one-time fee)
- **Total**: $25 one-time

## 🚀 Quick Start

1. Clone repository
2. Install dependencies: `npm install` in each folder
3. Deploy backend to Render.com (free)
4. Update API URL in mobile/web apps
5. Build and test locally
6. Submit to Google Play Store

## 📝 License

MIT License - Free to use and modify

## 🤝 Support

For issues or questions, create a GitHub issue.

---

Made with ❤️ for Ecuador 🇪🇨