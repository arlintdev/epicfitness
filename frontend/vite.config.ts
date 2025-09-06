import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174
  },
  // For GitHub Pages deployment
  base: process.env.NODE_ENV === 'production' ? '/epicfitness/' : '/'
})
