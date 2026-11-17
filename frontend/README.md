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

1. Import the repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Set **Build Command** to `npm run build`.
4. Set **Output Directory** to `dist`.
5. Add the environment variable `VITE_API_URL` with the deployed backend API base URL, including `/api` (for example, `https://api.example.com/api`).
6. Deploy. The included `vercel.json` rewrite serves the React entry point for client-side routes and refreshes.

Configure the backend's `FRONTEND_URL` to the deployed frontend origin so its CORS policy allows the Vercel site.
