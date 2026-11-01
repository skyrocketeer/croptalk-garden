import { defineConfig, loadEnv, type PluginOption } from 'vite'
import { createGardenApiHandler } from './server/api.mjs'

function gardenApiPlugin(): PluginOption {
  const handleGardenAPI = createGardenApiHandler()
  return {
    name: 'croptalk-garden-bff',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (!request.url?.startsWith('/api/')) {
          next()
          return
        }
        void handleGardenAPI(request, response)
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        if (!request.url?.startsWith('/api/')) {
          next()
          return
        }
        void handleGardenAPI(request, response)
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return { plugins: [gardenApiPlugin()] }
})
