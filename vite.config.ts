import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  server: {
    port: 3000,
  },
  build: {
    chunkSizeWarningLimit: 2000,
  },
  plugins: [tsConfigPaths(), tanstackStart(), tailwindcss(), viteReact()],
})
