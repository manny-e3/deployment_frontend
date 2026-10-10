# Deploy Portal — Internal Developer Platform

A mission-critical developer control plane built with **React (JavaScript / JSX)**, **Vite**, **Tailwind CSS v4**, and **React Router DOM v7** (no Next.js, no TypeScript).

## 🚀 Routes & Architecture

All views are backed by real URLs with `react-router-dom` and `localStorage` session persistence — reloading the browser will stay on the current page.

| Route | View | Description |
| :--- | :--- | :--- |
| `/login` | **Sign In** | Developer console authentication card |
| `/dashboard` | **Dashboard** | Control plane telemetry, metric cards, recent deployments |
| `/projects` | **Projects Catalog** | 6-card service grid, filters, and Git onboarding |
| `/projects/:projectId` | **Project Details** | Target servers table, auto-deploy switch, live terminal |
| `/servers` | **Servers & Nodes** | Cluster nodes with status pills and IP addresses |
| `/deployments` | **Deployments** | Full pipelines run history and streaming log viewer |
| `/users` | **Users & IAM** | Team roles and permissions |
| `/audit-log` | **Audit Trail** | Cryptographically signed deployment records |
| `/settings` | **Settings** | Cluster origins and webhook endpoints |

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```

### 3. Production Build
```bash
npm run build
```

Build output is generated into `dist/`.

## 🐳 Docker Deployment

The application is fully containerized using a multi-stage Docker build with **Nginx (Alpine)** for production and a dedicated development target.

### 1. Run with Docker Compose (Recommended)

Start the production container on port `3000`:
```bash
docker compose up -d
```
The frontend is available at `http://localhost:3000` and automatically proxies `/api/` and `/socket.io/` requests to the backend API (`http://api:9000`).

To run with live reload for development:
```bash
docker compose --profile dev up frontend-dev
```
Available at `http://localhost:5173`.

To stop the containers:
```bash
docker compose down
```

### 2. Run with Docker CLI Directly

Build the production image:
```bash
docker build -t deployment-front .
```

Run connected to the backend Docker network:
```bash
docker run -d \
  --name deploy-portal-frontend \
  -p 3000:80 \
  --network deploy-portal_default \
  -e BACKEND_URL=http://api:9000 \
  deployment-front
```

Or run standalone against a host backend:
```bash
docker run -d \
  --name deploy-portal-frontend \
  -p 3000:80 \
  -e BACKEND_URL=http://host.docker.internal:9000 \
  deployment-front
```

### 3. Docker Architecture Features
- **Multi-Stage Build**: Keeps the final image lightweight (~25MB) using Alpine Linux.
- **Single Page Application Routing**: Nginx is configured with `try_files $uri $uri/ /index.html` to prevent 404s on browser reload.
- **Dynamic Reverse Proxy**: Transparently proxies `/api/` and `/socket.io/` (with WebSocket upgrade headers) to `${BACKEND_URL}`.
- **Asset Caching**: 1-year immutable cache for hashed Vite bundles under `/assets/`, and `no-cache` for `index.html`.
- **Gzip Compression**: Pre-enabled for text, CSS, JS, JSON, and SVG.
- **Health Checks**: Built-in `/healthz` endpoint with Docker healthcheck integration.

