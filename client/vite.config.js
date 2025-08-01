import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",   // ← allow external devices
    port: 5173,        // default Vite port
    proxy: {
      '/api': 'http://127.0.0.1:5000'
    }
  }
});