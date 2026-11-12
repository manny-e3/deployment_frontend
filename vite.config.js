import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Helper plugin to probe any URL server-side (bypassing CORS)
const probePlugin = () => ({
  name: 'health-check-probe-middleware',
  configureServer(server) {
    const handleProbe = async (req, res) => {
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
    }

    server.middlewares.use('/probe-url', handleProbe)
    server.middlewares.use('/appdeploy/probe-url', handleProbe)
  }
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:9000'

  // Default to '/' base for standard root deployment, allow override via VITE_ROUTER_BASE
  const rawBase = env.VITE_ROUTER_BASE || '/'
  const base = rawBase === '/' ? '/' : (rawBase.endsWith('/') ? rawBase : `${rawBase}/`)

  return {
    base,
    plugins: [
      tailwindcss(),
      react(),
      probePlugin(),
    ],
    server: {
      port: 5173,
      proxy: {
        '/appdeploy/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/appdeploy\/api/, '/api'),
          cookieDomainRewrite: 'localhost',
        },
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          cookieDomainRewrite: 'localhost',
        },
        '/socket.io': {
          target: proxyTarget,
          changeOrigin: true,
          ws: true,
          secure: false,
        },
      },
    },
  }
})
