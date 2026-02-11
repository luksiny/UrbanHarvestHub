# Urban Harvest Hub - Full-Stack PWA

A Progressive Web Application for managing urban harvest workshops, products, and community events.

## Features

### Backend API
- ✅ Express.js REST API with MongoDB
- ✅ CRUD operations for Workshops, Products, Events, and Bookings
- ✅ Input validation and error handling
- ✅ Search and filtering capabilities

### Database
- ✅ MongoDB with Mongoose ODM
- ✅ Well-structured schemas with relationships
- ✅ Indexed fields for performance

### PWA Features
- ✅ Web App Manifest for installability
- ✅ Service Worker for offline access
- ✅ Optimized for Lighthouse PWA score 90+

### Mobile Capabilities
- ✅ Dark Mode toggle (persisted in localStorage)
- ✅ Geolocation API integration
- ✅ Responsive design for mobile devices

### Frontend
- ✅ React SPA with React Router
- ✅ Dynamic API integration with Axios
- ✅ Search and filter functionality
- ✅ Master-Detail views for all resources

## Tech Stack

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- express-validator for validation

**Frontend:**
- React 18
- React Router DOM
- Axios for API calls
- Service Worker for PWA

## Installation

1. Clone the repository
2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

4. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your MongoDB connection string:
```
MONGODB_URI=mongodb://localhost:27017/urbanharvesthub
```

5. Start the development server:
```bash
npm run dev
```

This will start both the backend (port 5000) and frontend (port 3000).

## Deployment

### Backend Deployment (Render/Railway)

1. Create a new web service
2. Connect your GitHub repository
3. Set environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `NODE_ENV`: production
   - `PORT`: (usually auto-set by platform)
4. Build command: `npm install`
5. Start command: `npm start`

### Frontend Deployment (Netlify/Vercel)

1. Build the React app:
```bash
cd frontend
npm run build
```

2. Deploy the `build` folder to Netlify or Vercel
3. Set environment variable:
   - `REACT_APP_API_URL`: Your backend API URL (e.g., https://your-api.onrender.com/api)

### MongoDB Setup

1. Create a free MongoDB Atlas account
2. Create a cluster
3. Get your connection string
4. Update `MONGODB_URI` in your environment variables

## API Endpoints

### Workshops
- `GET /api/workshops` - Get all workshops (with filters)
- `GET /api/workshops/:id` - Get single workshop
- `POST /api/workshops` - Create workshop
- `PUT /api/workshops/:id` - Update workshop
- `DELETE /api/workshops/:id` - Delete workshop

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Events
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get single booking
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

## PWA Features

The app is installable on mobile devices and works offline thanks to:
- Service Worker caching
- Web App Manifest
- Responsive design
- Optimized performance

## License

ISC
