import axios from 'axios';
import { defineNuxtPlugin } from '#app'; // Or 'nuxt/app' in some Nuxt 3 versions

export default defineNuxtPlugin(nuxtApp => {
  let token = null;
  if (process.client) {
    token = localStorage.getItem('token');
  }

  // Access runtime configuration for public variables
  const runtimeConfig = nuxtApp.$config || nuxtApp.payload.config; // Nuxt 3.0-3.7 vs 3.8+
  const apiBaseUrl = runtimeConfig.public.apiBaseUrl || 'https://finance.flflstore.com/api'; // Fallback if not set

  const api = axios.create({
    baseURL: apiBaseUrl,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    if (process.client) {
      console.warn('Authorization token not found in localStorage. API calls may fail if authentication is required.');
    }
  }

  // Optional: Request interceptor to dynamically update token if it changes during app lifecycle
  // Consider if your app has token refresh logic that would require this.
  // api.interceptors.request.use(config => {
  //   if (process.client) {
  //     const currentToken = localStorage.getItem('token');
  //     if (currentToken && config.headers) { // Ensure headers object exists
  //       config.headers.Authorization = `Bearer ${currentToken}`;
  //     }
  //   }
  //   return config;
  // }, error => {
  //   return Promise.reject(error);
  // });

  // Inject $api into the Nuxt app
  // This makes it available as nuxtApp.$api (in plugins/middleware), useNuxtApp().$api (in composables/setup),
  // and this.$api (in Options API components)
  nuxtApp.provide('api', api);
});
