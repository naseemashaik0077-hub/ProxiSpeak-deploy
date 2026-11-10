import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Reachable from another device on the network, which is how you test
    // WebRTC between two machines without deploying.
    host: "0.0.0.0",
    port: 5173,
    // Fail loudly rather than sliding to 5174 — a different port silently breaks
    // the server's CORS_ORIGIN.
    strictPort: true,
  },
})
