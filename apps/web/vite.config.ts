import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite-plus'

export default defineConfig({
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
})
