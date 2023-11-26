const isP = process.env.NODE_ENV === 'production';
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/hernadi-fullpage.js`,
        chunkFileNames: `assets/hernadi-fullpage.js`,
        assetFileNames: `assets/hernadi-fullpage.[ext]`
      }
    }
  }
})