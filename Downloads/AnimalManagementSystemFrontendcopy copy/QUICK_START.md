# Quick Start Guide

## Prerequisites Check
- ✅ Node.js installed
- ✅ MongoDB installed and running

## Step-by-Step Setup

### 1. Start MongoDB
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows (should start automatically)
```

### 2. Setup Backend
```bash
cd backend
npm install
npm run dev
```

**Expected Output:**
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:5000
```

### 3. Setup Frontend (New Terminal)
```bash
# From project root
npm install  # If not already done
npm run dev
```

**Expected Output:**
```
VITE v6.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### 4. Open Application
- Open browser: `http://localhost:5173`
- Login with any email (no password required)
- Start using the application!

## Verify Everything Works

1. **Backend Health**: Visit `http://localhost:5000/api/health`
   - Should show: `{"status":"OK","message":"Server is running"}`

2. **Create Test Data**:
   - Go to Animal Registry
   - Click "Add New Animal"
   - Fill in the form and save
   - Verify it appears in the list

3. **Test Delete**:
   - Click the trash icon on any item
   - Confirm deletion
   - Verify item is removed

4. **Check Reports**:
   - Navigate to Reports page
   - Verify charts display correctly
   - Check financial metrics calculate properly

## Common Issues

### Backend won't start
- **Solution**: Make sure MongoDB is running
- **Check**: `mongosh` should connect successfully

### Frontend can't connect to backend
- **Solution**: Verify backend is running on port 5000
- **Check**: Visit `http://localhost:5000/api/health`

### Port already in use
- **Backend**: Change `PORT` in `backend/.env`
- **Frontend**: Vite will automatically use next available port

## What's Working

✅ All CRUD operations for all modules
✅ Delete functionality for all modules
✅ Reports page with real data
✅ Data persistence in MongoDB
✅ Auto-generated IDs
✅ Automatic inventory status calculation

## Next Steps

1. Add your first animal
2. Create health records
3. Set up feeding schedules
4. Add inventory items
5. Manage staff members
6. View reports and analytics

Enjoy your Animal Management System! 🐾

