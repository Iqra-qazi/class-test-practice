# Clinic Appointment Management System

The frontend is a React application built with Vite. Its API requests use the existing Express backend.

## Requirements

- Node.js LTS and npm
- The Clinic Appointment Management backend and a configured MongoDB database

## Run locally

1. Install backend dependencies and configure its environment:

   ```powershell
   cd backend
   npm install
   Copy-Item .env.example .env
   ```

2. Set the backend variables in `backend/.env`:

   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_long_random_secret
   FRONTEND_URL=http://localhost:5173
   ```

   Start the API:

   ```powershell
   npm start
   ```

3. In a second terminal, install and configure the frontend:

   ```powershell
   cd frontend
   npm install
   Copy-Item .env.example .env
   ```

4. Set `VITE_API_URL` in `frontend/.env` to the backend API base URL, including `/api`:

   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

5. Start Vite:

   ```powershell
   npm run dev
   ```

   Open the local URL printed by Vite (normally `http://localhost:5173`).

Vite reads `VITE_API_URL` at startup/build time. Restart the dev server after changing it. Keep `.env` files private; only commit the `.env.example` files.

## Frontend checks

From `frontend`:

```powershell
npm run lint
npm run build
```

The production files are written to `frontend/dist`.

## Deploy to Vercel

Deploy the frontend and backend as separate Vercel projects from the same repository.

### Frontend project

1. Set **Root Directory** to `frontend`.
2. Set **Build Command** to `npm run build`.
3. Set **Output Directory** to `dist`.
4. Set `VITE_API_URL` to the backend origin with `/api` appended:

   ```env
   VITE_API_URL=https://class-test-practice-72ly.vercel.app/api
   ```

5. Deploy. The included `vercel.json` rewrite serves the React entry point for client-side routes and refreshes.

### Backend project

1. Set **Root Directory** to `backend` and use Vercel's Express framework detection. The Express application is in `src/app.js` and is started by `server.js`; no separate backend `vercel.json` is needed for this Express deployment.
2. Configure these Vercel environment variables:
   - `MONGODB_URI` — MongoDB connection string; allow Vercel's outbound connections in the database network settings.
   - `JWT_SECRET` — a long, random signing secret.
   - `FRONTEND_URLS` — comma-separated, exact browser origins allowed by CORS, without paths. Include the production frontend origin and any preview origin you intend to use, for example:

     ```text
     https://class-test-practice.vercel.app,https://class-test-practice-72ly-lj64hl8b5-iqra-team1.vercel.app
     ```

   - `PORT` is optional; Vercel supplies the runtime port.
3. Deploy the backend. `FRONTEND_URL` remains supported for a single origin; `FRONTEND_URLS` adds multiple origins.

`ADMIN_EMAIL` and `ADMIN_PASSWORD` are only needed when running `npm run seed:admin` manually; they are not required as Vercel runtime variables. The ImageKit upload helper is not currently connected to an API route; set `IMAGEKIT_PRIVATE_KEY` only if you wire it into a feature. `GOOGLE_CLIENT_ID` is not currently used by the app.

After changing `VITE_API_URL`, redeploy the frontend because Vite embeds it at build time. After changing `FRONTEND_URL` or `FRONTEND_URLS`, redeploy the backend.

## API smoke checks

- `GET https://class-test-practice-72ly.vercel.app/` should return the API health response.
- `POST /api/auth/register` and `POST /api/auth/login` are the public auth endpoints. Use the frontend forms for a real signup/login test; do not send real account credentials in shell history.
- `GET /api/doctors` and all appointment/admin routes are protected and require `Authorization: Bearer <token>` with a user of the appropriate role.
- Test patient booking, patient appointment listing/cancellation, doctor appointment listing/status changes, and admin user/stats/appointment routes with role-appropriate accounts.

This application manages clinic doctors and appointments; it does not define a products API.
