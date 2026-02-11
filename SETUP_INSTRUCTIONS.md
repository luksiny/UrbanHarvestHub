# Setup Instructions - Fix Common Errors

## Step 1: Install Dependencies ✅ (Already Done)
```powershell
npm install
cd frontend
npm install
cd ..
```

## Step 2: Create .env File

Create a `.env` file in the root directory with:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/urbanharvesthub
```

**OR if using MongoDB Atlas (cloud):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/urbanharvesthub
```

## Step 3: Start MongoDB

**Option A: Local MongoDB**
- Make sure MongoDB is installed and running
- Default connection: `mongodb://localhost:27017/urbanharvesthub`

**Option B: MongoDB Atlas (Cloud - Recommended)**
- Go to https://www.mongodb.com/cloud/atlas
- Create free account
- Create cluster
- Get connection string
- Update MONGODB_URI in .env

## Step 4: Run the Application

**Start Backend Only:**
```powershell
npm start
```

**Start Frontend Only:**
```powershell
npm run client
```

**Start Both (Recommended):**
```powershell
npm run dev
```

## Common Errors & Solutions

### Error: "Cannot find module 'express'"
**Solution:** Run `npm install` in root directory

### Error: "MongoDB Connection Error"
**Solutions:**
1. Make sure MongoDB is running (if local)
2. Check MONGODB_URI in .env file
3. For Atlas: Check IP whitelist and credentials

### Error: "Cannot find module" in frontend
**Solution:** 
```powershell
cd frontend
npm install
```

### Error: Port 5000 already in use
**Solution:** Change PORT in .env file to another port (e.g., 5001)

## Quick Test

1. Backend should show: `✅ MongoDB Connected` and `🚀 Server running on port 5000`
2. Frontend should open at: `http://localhost:3000`
3. Test API: Open `http://localhost:5000/api/health` in browser
