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
        <template v-for="item in navItems" :key="item.title">
          <v-list-group v-if="item.subItems" :value="item.title">
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" :prepend-icon="item.icon" :title="item.title"></v-list-item>
            </template>
            <v-list-item
              v-for="subItem in item.subItems"
              :key="subItem.to"
              :to="subItem.to"
              router
              exact
            >
              <v-list-item-title>{{ subItem.title }}</v-list-item-title>
            </v-list-item>
          </v-list-group>
          <v-list-item v-else :to="item.to" router exact>
            <template v-slot:prepend>
              <v-icon>{{ item.icon }}</v-icon>
            </template>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </template>
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
  { to: '/dashboard', icon: 'mdi-view-dashboard', title: 'Dashboard' },
  { to: '/pendingorders', icon: 'mdi-clipboard-list', title: 'Orders' },
  { to: '/collections', icon: 'mdi-folder-multiple', title: 'Collections' },
  { to: '/admin/messages', icon: 'mdi-message', title: 'Messages' },
  { to: '/currency-management', icon: 'mdi-cash', title: 'Currency' },
  { to: '/places', icon: 'mdi-map-marker', title: 'Places' },
  { to: '/banks', icon: 'mdi-bank', title: 'Banks' },

  { to: '/members', icon: 'mdi-account-group-outline', title: 'Members' },
  { to: '/users', icon: 'mdi-account-group-outline', title: 'Users' },


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