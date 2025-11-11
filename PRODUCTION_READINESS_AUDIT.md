## Production Readiness Audit – Executable Checklist

Use this file to verify the system is ready for production. Check off each item and run the commands as you go. Commands are provided for both PowerShell and bash where relevant.

### 1) Prerequisites

- [ ] Install Node.js 20+
- [ ] Install Docker and Docker Compose (if using containers)
- [ ] PostgreSQL reachable from the runtime environment

### 2) Configure Secrets and Environment

- [ ] Create `.env` from `env.production.template` (or configure platform secrets)
- [ ] Set strong values for `DATABASE_URL`, `JWT_SECRET`, `SESSION_SECRET`
- [ ] Set `NODE_ENV=production`, `PORT` (default 5000), and production `ALLOWED_ORIGINS`
- [ ] Disable debug logs: `ENABLE_DEBUG_LOGS=false`, `VITE_ENABLE_DEBUG_LOGS=false`

PowerShell (example):

```powershell
Copy-Item env.production.template .env -Force
(Get-Content .env) -replace 'username:password@your-production-db-host', 'solnetuser:solnetpass@db.myhost' | Set-Content .env
# Then manually edit JWT_SECRET, SESSION_SECRET, ALLOWED_ORIGINS with strong values
```

bash (example):

```bash
cp env.production.template .env
# Edit .env to set DATABASE_URL, JWT_SECRET, SESSION_SECRET, ALLOWED_ORIGINS, etc.
```

### 3) Install Dependencies

- [ ] Clean install dependencies

PowerShell:

```powershell
npm ci
```

bash:

```bash
npm ci
```

### 4) Build Artifacts

- [ ] Build client and server bundles into `dist/`

```powershell
npm run build
```

Verify build output:

- [ ] `dist/index.js` exists
- [ ] `dist/public/index.html` and assets exist

### 5) Database Migrations and Verification

- [ ] Ensure `DATABASE_URL` in `.env` points to the intended database
- [ ] Run migrations and verify tables

```powershell
npm run db:migrate
npm run db:verify
```

Optional indexes for performance:

```powershell
npm run db:indexes
```

### 6) Run Locally in Production Mode (without Docker)

- [ ] Start the server using the built output

```powershell
$env:NODE_ENV = 'production'
node dist/index.js
```

bash:

```bash
NODE_ENV=production node dist/index.js
```

Health check (in a separate terminal):

```powershell
curl http://localhost:5000/api/health
```

### 7) Run with Docker Compose (recommended)

- [ ] Build and start services

```powershell
docker compose up --build -d
```

Check container logs:

```powershell
docker compose logs -f app
```

Health check:

```powershell
curl http://localhost:5000/api/health
```

Uploads persistence:

- [ ] Confirm `uploads_data` volume is present

```powershell
docker volume ls | Select-String uploads_data
```

### 8) Security Controls

- [ ] Rate limiting enabled (via `express-rate-limit`)
- [ ] Security headers and CSP enabled (`helmet`)
- [ ] CORS restricted to `ALLOWED_ORIGINS` production domains
- [ ] `app.set('trust proxy', 1)` active behind reverse proxy (already set)
- [ ] Strong `JWT_SECRET` and `SESSION_SECRET` configured

### 9) Monitoring and Logging

- [ ] Centralized logs (stdout) collected by platform (e.g., CloudWatch/ELK)
- [ ] Alerts on 5xx rates, healthcheck failures
- [ ] `logger` emits JSON; enable info/debug selectively (`ENABLE_DEBUG_LOGS`)

### 10) Go/No-Go Verification

- [ ] API health check returns 200: `/api/health`
- [ ] Static assets served from `dist/public` in production mode
- [ ] DB connections stable; migrations applied in production DB
- [ ] CORS and auth flows verified from production domains
- [ ] If scaling horizontally: switch `uploads/` to shared or object storage

Quick end-to-end smoke test (PowerShell):

```powershell
# 1) Health
curl http://localhost:5000/api/health

# 2) Static index
curl http://localhost:5000/ | Select-String '<!DOCTYPE html>'

# 3) Example protected call (replace TOKEN)
$headers = @{ Authorization = 'Bearer REPLACE_WITH_JWT' }
try { Invoke-RestMethod -Uri http://localhost:5000/api/customers -Headers $headers -Method GET } catch { $_.Exception.Response.StatusCode }
```

If all items are checked and commands complete successfully, the system is production-ready.





