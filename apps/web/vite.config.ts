import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig, loadEnv } from 'vite-plus'

const envDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envDir, '')
  for (const [key, value] of Object.entries(env)) {
    process.env[key] ??= value
  }

  return {
    envDir,

    server: {
      port: 3000,
    },

    resolve: {
      tsconfigPaths: true,
    },

    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },

    plugins: [
      tanstackStart({
        srcDirectory: 'src',
      }),
      nitro({
        traceDeps: ['react', 'react-dom'],
      }),
      viteReact(),
    ],
  }
})
