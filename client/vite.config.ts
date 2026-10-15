import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// The SPA calls the API on its own origin (/api/...), so the session cookie stays first-party.
// In development Vite forwards those calls to the Spring Boot backend.
const backend = {
  '/api': { target: 'http://localhost:8080', changeOrigin: false },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { proxy: backend },
  preview: { proxy: backend },
});
