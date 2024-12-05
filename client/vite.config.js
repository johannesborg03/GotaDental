import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite'
import { BootstrapVueNextResolver } from 'bootstrap-vue-next'

export default defineConfig({
  plugins: [ vue(),
    Components({
      resolvers: [BootstrapVueNextResolver()]  }) ],
  build: {
    rollupOptions: {
      // Ensure Bootstrap's CSS is not treated as an external dependency
      external: ['bootstrap']
    }
  },
  optimizeDeps: {
    // Explicitly include Bootstrap and its CSS
    include: ['bootstrap', 'bootstrap/dist/css/bootstrap.css', 'leaflet']
  }
});

