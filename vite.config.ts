import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    // Increase chunk size warning limit (in kB)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Better code splitting for improved caching
        manualChunks: {
          // Vendor chunks - split large dependencies
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-gsap': ['gsap'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
})
