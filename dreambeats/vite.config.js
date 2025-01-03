import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' 
    ? '/DreamBeats-/' 
    : '/',
  server: {
    hmr: {
      overlay: false,
      protocol: 'ws',
      host: 'localhost',
      port: 5173
    }
  }
})
