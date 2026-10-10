import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Helper plugin to probe any URL server-side (bypassing CORS)
const probePlugin = () => ({
  name: 'health-check-probe-middleware',
  configureServer(server) {
    server.middlewares.use('/probe-url', async (req, res) => {
      try {
        const parsed = new URL(req.url, 'http://localhost:5173')
        const targetUrl = parsed.searchParams.get('url')
        if (!targetUrl) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: false, error: 'Missing url query param' }))
          return
        }

        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 8000)

        const response = await fetch(targetUrl, {
          method: 'GET',
          headers: { 'User-Agent': 'DeployPortal-HealthProbe/2.1' },
          signal: controller.signal,
          cache: 'no-store'
        })
        clearTimeout(timer)

        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          ok: response.status >= 200 && response.status < 400,
          status: response.status,
          statusText: response.statusText,
          url: targetUrl
        }))
      } catch (err) {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          ok: false,
          status: 500,
          statusText: err.message || 'Connection Refused',
          error: err.message
        }))
      }
    })
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    probePlugin(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:9000',
      '/socket.io': {
        target: 'http://localhost:9000',
        ws: true,
      },
    },
  },
})

