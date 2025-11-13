# Animal Management System - Setup Guide

This guide will help you set up the complete Animal Management System with MongoDB backend.

## Prerequisites

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** - [Download](https://www.mongodb.com/try/download/community)
3. **npm** (comes with Node.js)

## Installation Steps

### 1. Install MongoDB

#### macOS (using Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux:
```bash
# Follow MongoDB installation guide for your distribution
# https://docs.mongodb.com/manual/installation/
sudo systemctl start mongod
```

#### Windows:
- Download MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
- Install and start MongoDB service

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install backend dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
# Development mode (with auto-reload)
npm run dev

# OR Production mode
npm start
```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup

1. Navigate to the project root (if not already there):
```bash
cd ..
```

2. Install frontend dependencies (if not already installed):
```bash
npm install
```

3. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## Running the Application

1. **Start MongoDB** (if not running as a service):
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`
   - Windows: MongoDB should start automatically as a service

2. **Start the Backend**:
   ```bash
   cd backend
   npm run dev
   ```
   You should see: `🚀 Server running on http://localhost:5000`

3. **Start the Frontend** (in a new terminal):
   ```bash
   npm run dev
   ```
   You should see the Vite dev server URL

4. **Open the Application**:
   - Open your browser and navigate to the frontend URL (usually `http://localhost:5173`)
   - The application should load and connect to the backend

## Verification

1. **Check Backend Health**:
   - Open `http://localhost:5000/api/health` in your browser
   - You should see: `{"status":"OK","message":"Server is running"}`

2. **Check MongoDB Connection**:
   - The backend console should show: `✅ Connected to MongoDB`

3. **Test the Application**:
   - Login with any email (no password required in current setup)
   - Navigate through different modules
   - Try creating, updating, and deleting records

## Troubleshooting

### Backend won't start
- **Error: "Cannot find module"**: Run `npm install` in the backend directory
- **Error: "Port 5000 already in use"**: Change the PORT in `backend/.env` or stop the process using port 5000
- **Error: "MongoDB connection failed"**: Make sure MongoDB is running

### Frontend won't connect to backend
- **CORS errors**: Make sure the backend is running and CORS is enabled (already configured)
- **Network errors**: Check that the backend URL in `src/services/api.ts` matches your backend port
- **404 errors**: Verify the backend routes are correct

### MongoDB connection issues
- **"Connection refused"**: Make sure MongoDB is running
- **"Authentication failed"**: Check MongoDB connection string in `backend/.env`
- **"Database not found"**: MongoDB will create the database automatically on first use

## API Endpoints

All API endpoints are prefixed with `/api`:

- `/api/animals` - Animal management
- `/api/health-records` - Health records
- `/api/feeding-tasks` - Feeding schedules
- `/api/breeding-records` - Breeding management
- `/api/inventory` - Inventory management
- `/api/staff` - Staff management
- `/api/settings` - Facility settings

## Data Persistence

All data is stored in MongoDB. The database name is `animal-management` (configurable in `backend/.env`).

Data persists between server restarts. To reset the database:
1. Stop the backend server
2. Connect to MongoDB: `mongosh`
3. Run: `use animal-management` then `db.dropDatabase()`
4. Restart the backend server

## Development Tips

1. **Backend Auto-reload**: Use `npm run dev` in the backend for automatic server restarts
2. **Frontend Hot Reload**: Vite automatically reloads on file changes
3. **MongoDB Compass**: Install [MongoDB Compass](https://www.mongodb.com/products/compass) for a GUI to view your data
4. **API Testing**: Use tools like Postman or curl to test API endpoints directly

## Production Deployment

For production:
1. Set `NODE_ENV=production` in backend `.env`
2. Build the frontend: `npm run build`
3. Serve the frontend build folder with a web server (nginx, Apache, etc.)
4. Use a process manager (PM2) for the backend
5. Configure MongoDB for production with proper authentication

## Support

If you encounter issues:
1. Check the console logs (both frontend and backend)
2. Verify MongoDB is running
3. Ensure all dependencies are installed
4. Check that ports are not in use by other applications

