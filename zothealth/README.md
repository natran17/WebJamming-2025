# ZotHealth - Health & Exercise Assistant (MVP)
Production-ready MVP with Node.js, Express, MongoDB (Mongoose), JWT auth, and a minimal React + Tailwind client.

## Features
- **Auth**: Register, Login, Refresh (httpOnly cookie), Logout
- **Profile**: View/Update user profile
- **Workouts**: Weekly schedule CRUD
- **Meals**: Recipes + items, daily calorie tracking summary
- **AI**: Generate weekly plan (rule-based placeholder)
- **Dining Hall search**: sample endpoint

## Stack
- Backend: Node.js + Express
- DB: MongoDB (Mongoose)
- Auth: JWT (Access + Refresh with rotation in cookies)
- Frontend: React + Vite + Tailwind
- Optional: S3-compatible object storage (stub)

### MongoDB vs Supabase/Postgres
- MongoDB (document DB) fits flexible nested schemas (weekly plans, meals). Simple to iterate.
- Postgres (relational) offers strong relations/joins, strict schemas, powerful SQL.
- Supabase adds hosted Postgres, auth, storage, and RLS. Great DX, less custom auth code.

## Environment Variables
See `.env.example`.
- `PORT`: API port
- `NODE_ENV`: development/production/test
- `CORS_ORIGIN`: comma-separated allowed origins (e.g., http://localhost:5173)
- `MONGODB_URI`, `MONGODB_URI_TEST`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES` (default 15m), `JWT_REFRESH_EXPIRES` (default 7d)
- `S3_*` (optional)

## Local Setup
```bash
# Backend
cd zothealth
cp .env.example .env
npm i
# ensure MongoDB is running locally (brew services start mongodb-community or Docker)
npm run seed
npm run dev

# Frontend
cd client
npm i
npm run dev
```
API: http://localhost:4000  
Web: http://localhost:5173

## cURL Examples
```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"name":"Demo","email":"demo@zot.app","password":"Password123!"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt -b cookies.txt \
  -d '{"email":"demo@zot.app","password":"Password123!"}'

# Get Profile (replace TOKEN)
curl http://localhost:4000/api/users/me -H "Authorization: Bearer TOKEN"

# Create Workout
curl -X POST http://localhost:4000/api/workouts \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Week 1","weekOf":"2025-01-01","days":[{"day":"monday","exercises":[{"name":"Jogging","timeMinutes":20}]}]}'

# Add Meal entry
curl -X POST http://localhost:4000/api/meals \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"date":"2025-01-02","items":[{"name":"Oatmeal","calories":150}]}'

# Daily summary
curl "http://localhost:4000/api/meals/daily/summary?date=2025-01-02" -H "Authorization: Bearer TOKEN"

# AI Plan
curl -X POST http://localhost:4000/api/ai/generate-plan \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"goals":"maintain","preferredExerciseTypes":["cardio","legs"],"experience":"beginner"}'
```

## Tests
```bash
npm test
```

## Deployment (Render/Heroku/Vercel)
- Create repo on GitHub.
- Add env vars (see list) to provider.
- Build/run command: `npm i && npm run start`
- Expose port (Render autodetects). Enable persistent Mongo (MongoDB Atlas).
- Set CORS_ORIGIN to your frontend URL.

## Security Best Practices
- Password hashing with bcrypt (salted).
- Rate limiting auth endpoints; Helmet; CORS configured.
- HTTPS in production; secure, httpOnly cookies for refresh; SameSite=lax.
- Refresh token rotation and revocation on logout.
- Store secrets in env vars only; rotate regularly.

## Migrate to Supabase Auth + Postgres (Plan)
- Replace `auth` routes with Supabase Auth (Clerk is similar) and rely on provider-managed sessions.
- Remove `passwordHash` and `refreshTokens` from `User`; store `externalId` (UUID) from provider.
- Migrate models to SQL tables: users, workouts, exercises, meals, meal_items, recipes.
- Use Supabase Row-Level Security policies per user.
- Update frontend to use Supabase JS client; remove manual token attach; use `Authorization: Bearer` from session if needed.
- For object storage, replace `utils/s3.js` with Supabase Storage or provider SDK.

## Swap JWT with Clerk or Supabase Auth (Notes)
- Clerk: add Clerk middleware on API, verify sessions via Clerk SDK; `req.auth.userId`.
- Supabase: use `@supabase/ssr` or server clients to validate JWT; get `user.id` from token claims.

## File Tree
```
zothealth/
  .env.example
  .gitignore
  package.json
  server.js
  README.md
  jest.config.js
  scripts/seed.js
  src/
    config/db.js
    middleware/auth.js
    middleware/errorHandler.js
    models/{User.js,Workout.js,Meal.js}
    routes/{auth.js,users.js,workouts.js,meals.js,ai.js,search.js}
    utils/{jwt.js,s3.js}
  tests/{setup.js,auth.test.js,workouts.test.js}
  postman/ZotHealth.postman_collection.json
  client/
    package.json
    index.html
    vite.config.js
    postcss.config.js
    tailwind.config.js
    src/
      main.jsx
      App.jsx
      styles/index.css
      lib/api.js
      components/NavBar.jsx
      pages/{Home.jsx,Login.jsx,Signup.jsx,Dashboard.jsx,Exercises.jsx,MealPlanner.jsx}
```
