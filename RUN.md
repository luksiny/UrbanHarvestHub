# How to Run Your Application

## ✅ Dependencies Installed
- Backend dependencies: ✅ Installed
- Frontend dependencies: ✅ Installed

## ⚠️ Required: Create .env File

**Create a file named `.env` in the root directory** with this content:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/urbanharvesthub
```

**OR if using MongoDB Atlas (cloud - recommended):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/urbanharvesthub
```

## 🚀 Run Commands

### Option 1: Run Both Backend & Frontend Together (Recommended)
```powershell
npm run dev
```
This starts:
- Backend on http://localhost:5000
- Frontend on http://localhost:3000

### Option 2: Run Separately

**Terminal 1 - Backend:**
```powershell
npm start
# or for auto-reload:
npm run server
```

**Terminal 2 - Frontend:**
```powershell
npm run client
```

## 🔍 Check if it's Working

1. **Backend**: Open http://localhost:5000/api/health
   - Should show: `{"status":"OK","message":"Urban Harvest Hub API is running"}`

2. **Frontend**: Open http://localhost:3000
   - Should show the Urban Harvest Hub homepage

## ⚠️ Common Errors

### Error: "MongoDB Connection Error"
**Solution**: 
- Make sure MongoDB is running (if using local)
- OR use MongoDB Atlas (cloud) - it's free!
- Check your MONGODB_URI in .env file

### Error: "Port already in use"
**Solution**: Change PORT in .env to another number (e.g., 5001)

### Error: "Cannot find module"
**Solution**: Make sure you ran `npm install` in both root and frontend directories

## 📝 Next Steps

1. Create `.env` file (see above)
2. Set up MongoDB (local or Atlas)
3. Run `npm run dev`
4. Open http://localhost:3000 in your browser
