import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true, // Use localhost for secure context
    port: 5173,
  },
  define: {
    // Ensure secure context
    global: 'globalThis',
  },
});
