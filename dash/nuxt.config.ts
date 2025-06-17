// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: false },
  pages: true,
  
  runtimeConfig: {
    // Public keys (exposed to client-side)
    public: {
      // apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001/api'||'https://finance.flflstore.com/api' 
      apiBaseUrl: process.env.API_BASE_URL || 'https://finance.flflstore.com/api' 
    }
  },
  
  build: {
    transpile: ['vuetify'],
  },
  
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
    //...
  ],

  plugins: ['~/plugins/axios.js'],
  
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  nitro: {
    prerender: {
      // Skip prerendering routes that require API calls
      ignore: ['/PendingOrders']
    }
  },
  
  ssr: false,
  
  // Optional: Configure auto-imports if needed
  imports: {
    dirs: ['composables/**']
  }
})