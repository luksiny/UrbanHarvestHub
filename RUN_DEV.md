# Running the app in development

## Option 1: One command (both backend + frontend)

From the project root:

```bash
npm run dev
```

You’ll see `[server]` and `[client]` in the output. If one of them exits with code 1, the other will stop too.

---

## Option 2: Two terminals (to see which process fails)

**Terminal 1 – backend**

```bash
cd UrbanHarvestHub
npm run server
```

Wait until you see: `🚀 Server running on port 5000`  
If you see `❌ Database Error` or `❌ Failed to load models`, fix that first (MySQL + `.env`). The server still runs; API will return errors until the DB is fixed.

**Terminal 2 – frontend**

```bash
cd UrbanHarvestHub
npm run client
```

Wait until the browser opens at http://localhost:3000.

---

## If you see "exited with code 1"

- **Backend (server):** Check Terminal 1 for the real error (e.g. MySQL, missing `npm install`, or a crash log).
- **Frontend (client):** Check Terminal 2 (e.g. port 3000 in use, or a build error).

Run **Option 2** to see which process fails and the exact error message.
