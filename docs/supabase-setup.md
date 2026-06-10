# Supabase Postgres Setup

QuickSplit uses its own Django REST auth, Django ORM models, and JWT sessions. For Supabase we only need the Postgres connection string.

## What To Create

1. Create a Supabase project.
2. Save the database password you set during project creation.
3. Open the project dashboard and click **Connect**.
4. Choose **Session pooler** for local/dev or any IPv4-only environment.
5. Copy the connection string.
6. Replace `[YOUR-PASSWORD]` with the database password.
7. Django can use `postgres://` or `postgresql://`. Prefer `postgresql://` in `backend/.env`.
8. If your password has special characters such as `@`, `#`, `/`, or `:`, URL-encode it before placing it in `DATABASE_URL`.

Example:

```env
DATABASE_URL=postgresql://postgres.PROJECT_REF:DB_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres?sslmode=require
DATABASE_POOL_MODE=session
DATABASE_SSL=true
```

## Backend Env

Copy the example env file:

```bash
cp backend/.env.example backend/.env
```

Then update:

```env
SECRET_KEY=your-long-random-secret
DATABASE_URL=your-supabase-session-pooler-url
DATABASE_POOL_MODE=session
DATABASE_SSL=true
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Generate a local secret:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

## Frontend Env

```bash
cp frontend/.env.example frontend/.env
```

For local development:

```env
VITE_API_URL=http://localhost:9000/api/v1
```

## Run

```bash
cd backend
source venv/bin/activate
python manage.py migrate
python manage.py runserver 0.0.0.0:9000
```

```bash
cd frontend
npm run dev
```

Open `http://127.0.0.1:3000` or `http://localhost:3000`.

## Notes

- Do not put Supabase database credentials in the frontend.
- Do not use the Supabase anon key or service-role key for this backend. They are not needed unless we later switch to Supabase Auth, Storage, or Edge Functions.
- If you use Supabase transaction pooler on port `6543`, set `DATABASE_POOL_MODE=transaction` so Django does not hold persistent DB connections.
