<template>
  <v-app>
    <!-- App Bar for authenticated users -->
    <v-app-bar
      v-if="isAuthenticated"
      app
      clipped-left
      color="primary"
      dark
    >
      <v-app-bar-nav-icon @click="toggleDrawer" />
      <v-toolbar-title>Finance App</v-toolbar-title>
      <v-spacer />
      <v-btn icon @click="handleLogout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-if="isAuthenticated"
      v-model="drawer"
      app
      clipped
    >
      <v-list>
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          router
          exact
        >
          <template v-slot:prepend>
            <v-icon>{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    
    <!-- Main Content Area -->
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth';

const { isAuthenticated, signOut, checkAuthStatus } = useAuth();
const drawer = ref(true); // Start with drawer open

const navItems = [
  // { to: '/dashboard', icon: 'mdi-view-dashboard', title: 'Dashboard' },
  { to: '/pendingorders', icon: 'mdi-clipboard-list', title: 'Orders' },
  { to: '/collections', icon: 'mdi-folder-multiple', title: 'Collections' },
  // { to: '/index', icon: 'mdi-folder-multiple', title: 'Home' },
];

const toggleDrawer = () => {
  drawer.value = !drawer.value;
};

const handleLogout = async () => {
  try {
    await signOut();
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

// Check auth status on mount
onMounted(() => {
  checkAuthStatus();
});
</script>