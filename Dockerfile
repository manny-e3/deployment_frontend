# ==============================================================================
# Stage 1: Build the React + Vite application
# ==============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package.json package-lock.json ./

# Install dependencies deterministically
RUN npm ci

# Copy source files
COPY . .

# Build production bundle into /app/dist
RUN npm run build

# ==============================================================================
# Stage 2: Development target (for local development with live reload)
# ==============================================================================
FROM node:22-alpine AS development

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

ENV HOST=0.0.0.0
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ==============================================================================
# Stage 3: Production serving with Nginx Alpine
# ==============================================================================
FROM nginx:alpine AS production

# Default backend URL for API and WebSocket proxying
ENV BACKEND_URL="http://api:9000"
# Ensure envsubst only replaces BACKEND_URL in templates, leaving Nginx variables untouched
ENV NGINX_ENVSUBST_FILTER="^BACKEND_URL$"

# Remove default nginx static html
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled static assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx template
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Expose HTTP port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
