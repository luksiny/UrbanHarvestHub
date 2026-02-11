# MySQL / MySQL Workbench Setup

The backend now uses **MySQL** instead of MongoDB. Use MySQL Workbench (or any MySQL server) to create the database.

## 1. Create the database

In **MySQL Workbench** (or MySQL command line):

```sql
CREATE DATABASE IF NOT EXISTS urbanharvesthub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Or in MySQL Workbench: right‑click in the left panel → **Create Schema** → name: `urbanharvesthub` → Apply.

## 2. Environment variables

Copy `env.example` to `.env` in the project root and set your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=urbanharvesthub
DB_USER=root
DB_PASSWORD=your_mysql_password
```

## 3. Install dependencies and run

From the project root:

```bash
npm install
npm start
```

On first run, Sequelize will create all tables (`workshops`, `products`, `events`, `bookings`) automatically.

## 4. Seed data

To fill the database with sample workshops, products, and events:

```bash
npm run seed
```

## If you see "Backend not ready" on the site

1. **Run the backend in a terminal** so you see the real error:
   ```bash
   cd UrbanHarvestHub
   npm run server
   ```
   Look for a line like `❌ Failed to load models: ...` — that message tells you what’s wrong.

2. **Typical causes**
   - **"Cannot find module 'mysql2'" or "sequelize"** → From the project root run: `npm install`
   - **MySQL not running** → Start MySQL (or MySQL Workbench’s server). On Windows: Services → MySQL; or start from MySQL Workbench.
   - **Database doesn’t exist** → Create it (step 1 above).
   - **Wrong user/password** → Check `DB_USER` and `DB_PASSWORD` in `.env`. If the password has special characters (e.g. `!@#`), put it in double quotes: `DB_PASSWORD="aaAA12!@"`

3. **Check MySQL is reachable**
   - Open MySQL Workbench and connect with the same `DB_USER` / `DB_PASSWORD` / `DB_HOST` / `DB_PORT` as in `.env`.
   - Create the schema `urbanharvesthub` if it doesn’t exist.

After fixing, restart the backend (`npm run server`). When it’s ready you’ll see `✅ MySQL Connected` and `🚀 Server running on port 5000`. Then refresh the site.

---

## API (unchanged)

- **REST API** – Express with create, retrieve, update (and delete) for workshops, products, events, bookings.
- **Validation** – `express-validator` on POST/PUT.
- **Error handling** – Central middleware and proper status codes.

Endpoints: `/api/workshops`, `/api/products`, `/api/events`, `/api/bookings`.
