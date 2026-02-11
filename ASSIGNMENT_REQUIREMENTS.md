# Assignment Requirements – Compliance

This document maps each assignment requirement to the implementation.

---

## PWA Functionality

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| **Mobile-first responsive design** | ✅ | Viewport meta in `frontend/public/index.html`; `@media (max-width: 768px)` and similar in `index.css`, `Navbar.css`, `Home.css`, `Products.css`, `Events.css`, `Workshops.css`, `NearestHub.css`, `Detail.css`. Layouts stack and scale on small screens. |
| **Service worker for caching and offline functionality** | ✅ | `frontend/public/sw.js`: precaches `/`, `/manifest.json`, `/favicon.ico`; fetch handler uses stale-while-revalidate and caches same-origin GET responses for offline. Registered in `frontend/src/index.js` via `serviceWorkerRegistration.js`. |
| **Installable with a manifest (app name, icon, theme colours)** | ✅ | `frontend/public/manifest.json`: `name`, `short_name`, `icons` (favicon + logo192.png, logo512.png), `theme_color` (#2e7d32), `background_color`, `display: standalone`, `start_url`. Linked from `index.html`. Add `logo192.png` and `logo512.png` to `public/` for full install support on all devices. |
| **Push notifications for updates (e.g., events, new products)** | ✅ | When a new service worker is installed, an in-app banner appears (“New events and products available! Refresh to see updates.”). If the user has granted notification permission, a browser Notification is also shown. “Notify me next time” in the banner requests permission for future update notifications. See `UpdateBanner.js`, `index.js` (onUpdate), and `sw.js` (message SKIP_WAITING). |

---

## Backend API + Database

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| **REST API built with Express** | ✅ | `backend/index.js`: Express app, CORS, helmet, morgan, JSON body parser. Routes mounted under `/api/*`. |
| **Database integration MySQL** | ✅ | `backend/config/database.js` (Sequelize + mysql2), `backend/models/*.js`. Connection via `.env` (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME). |
| **Endpoints to create, retrieve, and update content (e.g., /items, /events)** | ✅ | **Events:** `GET/POST /api/events`, `GET/PUT/DELETE /api/events/:id`. **Products:** `GET/POST /api/products`, `GET/PUT/DELETE /api/products/:id`. **Workshops:** `GET/POST /api/workshops`, `GET/PUT/DELETE /api/workshops/:id`. **Bookings:** `GET/POST /api/bookings`, etc. |
| **Validation and error handling for POST/PUT requests** | ✅ | All POST/PUT use `express-validator` (e.g. `backend/routes/events.js` `validateEvent`, `backend/routes/products.js` `validateProduct`). `validationResult(req)`, 400 with `errors` array. Central error middleware and try/catch in handlers. |

---

## Frontend Integration

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| **React/Vue SPA consumes REST API data dynamically** | ✅ | React SPA in `frontend/src/`. API calls via `frontend/src/services/api.js` (axios). All list and detail pages fetch from `/api/*`. |
| **Data displayed with images, descriptions, and categories** | ✅ | Products: `getProductImage()` in `utils/productImages.js`; name, description, category, price. Events/Workshops: titles, descriptions, categories, dates; images via mapped paths. |
| **At least one search and filter feature** | ✅ | **Products:** search input, category dropdown, min/max price, organic filter (`Products.js` + API params). **Home:** search bar and category pills for featured items. **Events/Workshops:** category and search via API. |
| **Master–detail view (e.g., selecting an event shows its details)** | ✅ | **Events:** `Events.js` list → `EventDetail.js` (`/events/:id`). **Products:** `Products.js` → `ProductDetail.js` (`/products/:id`). **Workshops:** `Workshops.js` → `WorkshopDetail.js` (`/workshops/:id`). Detail pages fetch by ID from API. |

---

## Mobile Device Capabilities

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| **At least two features (e.g., light/dark mode, geolocation, notifications, offline access)** | ✅ | 1) **Light/dark mode:** Toggle in `Navbar.js`, theme in `App.js`, persisted in localStorage, CSS variables in `index.css` (`[data-theme="dark"]`). 2) **Geolocation:** `NearestHub.js` uses `navigator.geolocation.getCurrentPosition`, finds nearest workshops/events by distance (Haversine). 3) **Offline access:** Service worker caches app shell and same-origin GET so the app can load from cache when offline. 4) **Notifications:** Update banner + optional browser notifications for app updates (see PWA section). |

---

## Quick verification

- **PWA:** Run frontend, open DevTools → Application → Service Workers (registered), Manifest (name, icons, theme_color). Trigger an update (e.g. change `sw.js` and reload) to see the update banner.
- **Backend:** `npm run dev` (backend on port 5000), then e.g. `GET /api/events`, `POST /api/events` with invalid body (validation error).
- **Frontend:** Open Products → search/filter; open Events → click an event → detail page; toggle theme; open Nearest Hub → “Get My Location”.
