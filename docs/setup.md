# Ecuador Rideshare - Setup Guide

## Prerequisites

Before setting up the Ecuador Rideshare application, ensure you have the following installed:

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **Redis** (v6 or higher) - [Download](https://redis.io/download)
- **Git** - [Download](https://git-scm.com/)

### For Mobile Development
- **React Native CLI** - `npm install -g react-native-cli`
- **Expo CLI** - `npm install -g @expo/cli`
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

## Database Setup

### PostgreSQL Setup
1. Install PostgreSQL and create a new database:
   ```sql
   CREATE DATABASE ecuador_rideshare;
   CREATE USER rideshare_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE ecuador_rideshare TO rideshare_user;
   ```

2. The application will automatically create the necessary tables on first run.

### Redis Setup
1. Install and start Redis server:
   ```bash
   # On macOS with Homebrew
   brew install redis
   brew services start redis
   
   # On Ubuntu/Debian
   sudo apt-get install redis-server
   sudo systemctl start redis-server
   
   # On Windows
   # Download and install from https://redis.io/download
   ```

## Environment Configuration

### Backend Environment
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your configuration:
   ```env
   # Database
   DATABASE_URL=postgresql://rideshare_user:your_password@localhost:5432/ecuador_rideshare
   
   # Redis
   REDIS_URL=redis://localhost:6379
   
   # JWT Secrets (generate strong secrets for production)
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   
   # External Services
   SMS_PROVIDER_API_KEY=your-sms-provider-key
   AWS_ACCESS_KEY_ID=your-aws-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret
   ```

## Installation

### Install All Dependencies
From the root directory, run:
```bash
npm run install:all
```

This will install dependencies for:
- Root project
- Backend API
- Mobile application

### Individual Installation
If you prefer to install dependencies separately:

```bash
# Root dependencies
npm install

# Backend dependencies
cd backend && npm install

# Mobile dependencies
cd mobile && npm install
```

## Running the Application

### Development Mode
Start both backend and mobile app simultaneously:
```bash
npm run dev
```

### Individual Services

#### Backend API
```bash
cd backend
npm run dev
```
The API will be available at `http://localhost:3000`

#### Mobile App
```bash
cd mobile
npm start
```
Follow the Expo CLI instructions to run on your device or simulator.

## Verification

### Test Backend API
Visit `http://localhost:3000/health` to verify the backend is running.

### Test Database Connection
The backend will log database connection status on startup.

### Test Redis Connection
The backend will log Redis connection status on startup.

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **Redis Connection Error**
   - Verify Redis server is running
   - Check Redis URL in `.env`

3. **Mobile App Not Starting**
   - Ensure Expo CLI is installed globally
   - Check React Native development environment setup
   - Clear Metro cache: `npx react-native start --reset-cache`

4. **Port Already in Use**
   - Backend: Change `PORT` in `.env`
   - Mobile: Expo will automatically find available port

### Getting Help
- Check the logs for detailed error messages
- Ensure all prerequisites are properly installed
- Verify environment variables are correctly set

## Next Steps
Once setup is complete, you can:
- Access the API documentation at `http://localhost:3000/api`
- Start implementing features according to the task list
- Run tests with `npm test` in respective directories