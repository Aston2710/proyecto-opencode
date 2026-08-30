/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Vite inyecta en el paquete del cliente toda variable con este prefijo.
  // Se fija de forma explícita —aunque sea el valor por omisión— para que
  // ampliarlo sea una decisión visible en el diff y no un descuido.
  envPrefix: 'VITE_',

  build: {
    // Sin mapas de origen en producción: publicarlos entregaría el código
    // TypeScript completo a cualquiera que abra las herramientas de desarrollo.
    sourcemap: false,
  },

  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/pruebas/**/*.test.{ts,tsx}'],
  },
})
