# Quick Start Guide

## Local Development Setup

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Set Up MongoDB

**Option A: Local MongoDB**
- Install MongoDB locally
- Start MongoDB service
- Use connection string: `mongodb://localhost:27017/urbanharvesthub`

**Option B: MongoDB Atlas (Cloud)**
- Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster
- Get connection string
- Update `.env` file

### 3. Configure Environment

Create `.env` file in root directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/urbanharvesthub
```

### 4. Seed Database (Optional)

```bash
npm run seed
```

This will populate your database with sample workshops, products, and events.

### 5. Start Development Servers

```bash
npm run dev
```

This starts:
- Backend API on `http://localhost:5000`
- Frontend React app on `http://localhost:3000`

## Testing the Application

### Backend API
- Health check: `http://localhost:5000/api/health`
- Workshops: `http://localhost:5000/api/workshops`
- Products: `http://localhost:5000/api/products`
- Events: `http://localhost:5000/api/events`

### Frontend
- Open `http://localhost:3000` in your browser
- Test features:
  - Browse workshops, products, events
  - Search and filter functionality
  - Dark mode toggle (top right)
  - Geolocation button (top right)
  - Book a workshop
  - View detail pages

### PWA Features
1. **Install App**: 
   - Chrome/Edge: Look for install icon in address bar
   - Mobile: "Add to Home Screen" option
2. **Offline Mode**: 
   - Disconnect internet
   - App should still load cached content
3. **Service Worker**: 
   - Open DevTools → Application → Service Workers
   - Should see registered service worker

## Project Structure

```
UrbanHarvestHub/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   └── index.js         # Express server
├── frontend/
│   ├── public/          # Static files, manifest, service worker
│   └── src/
│       ├── components/  # React components
│       ├── pages/       # Page components
│       ├── services/    # API service layer
│       └── App.js       # Main app component
├── package.json
└── README.md
```

## Key Features Implemented

✅ **Backend API**
- Express.js REST API
- MongoDB with Mongoose
- CRUD operations for all resources
- Input validation
- Error handling

✅ **Database**
- MongoDB schemas for Workshops, Products, Events, Bookings
- Relationships between models
- Indexed fields for performance

✅ **PWA Features**
- Web App Manifest
- Service Worker for offline access
- Installable on mobile/desktop

✅ **Mobile Capabilities**
- Dark Mode toggle
- Geolocation API
- Responsive design

✅ **Frontend**
- React SPA with routing
- Dynamic API integration
- Search and filter
- Master-detail views

## Next Steps

1. **Add Icons**: Create proper PWA icons (192x192, 512x512 PNG files)
2. **Deploy**: Follow `DEPLOYMENT.md` guide
3. **Customize**: Update colors, content, and branding
4. **Enhance**: Add more features like user authentication, payment processing, etc.

## Troubleshooting

**MongoDB Connection Error**
- Check MongoDB is running
- Verify connection string in `.env`
- Check IP whitelist (for Atlas)

**Port Already in Use**
- Change PORT in `.env`
- Or kill process using the port

**Service Worker Not Working**
- Ensure you're on HTTPS (or localhost)
- Clear browser cache
- Check browser console for errors

**API Calls Failing**
- Verify backend is running
- Check CORS settings
- Verify `REACT_APP_API_URL` (if set)

## Need Help?

- Check `README.md` for detailed documentation
- Check `DEPLOYMENT.md` for deployment instructions
- Review code comments for implementation details
