import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

function cursorCasePlugin(): Plugin {
  return {
    name: 'case-insensitive-cursor',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url && /^\/cursor\.(svg|png)$/i.test(req.url)) {
          req.url = req.url.toLowerCase()
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cursorCasePlugin()],
})


