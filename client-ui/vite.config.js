import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      // Ensure Bootstrap's CSS is not treated as an external dependency
      external: ['bootstrap']
    }
  },
  optimizeDeps: {
    // Explicitly include Bootstrap and its CSS
    include: ['bootstrap', 'bootstrap/dist/css/bootstrap.css']
  }
});

