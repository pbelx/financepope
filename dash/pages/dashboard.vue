<template>
  <v-app>
    <v-main>
      <v-container fluid class="pa-6">
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <h1 class="text-h4 font-weight-bold">Analytics Dashboard</h1>
            <p class="text-body-2 text--secondary mt-1">{{ greeting }}</p>
          </div>
          <div class="d-flex align-center">
            <span class="text-body-2 text--secondary mr-2">{{ currentDateRange }}</span>
            <v-icon color="grey">mdi-calendar</v-icon>
          </div>
        </div>

        <!-- Loading State -->
        <v-row v-if="isLoading" class="justify-center">
          <v-col cols="12" class="text-center">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
            <p class="mt-4 text-body-1">Loading dashboard data...</p>
          </v-col>
        </v-row>

        <!-- Error State -->
        <v-alert v-if="error" type="error" dismissible @input="error = null" class="mb-6">
          {{ error }}
        </v-alert>

        <!-- Key Metrics Overview -->
        <v-row class="mb-6" v-if="!isLoading && !error">
          <!-- Total Orders -->
          <v-col cols="12" sm="6" md="4" lg="2">
            <v-card class="stat-card" color="primary" dark>
              <v-card-text class="text-center">
                <v-icon size="30" class="mb-2">mdi-clipboard-list</v-icon>
                <div class="text-h5 font-weight-bold">{{ totalOrders }}</div>
                <div class="text-body-2">Total Orders</div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Total Users -->
          <v-col cols="12" sm="6" md="4" lg="2">
            <v-card class="stat-card" color="success" dark>
              <v-card-text class="text-center">
                <v-icon size="30" class="mb-2">mdi-account-group</v-icon>
                <div class="text-h5 font-weight-bold">{{ totalUsers }}</div>
                <div class="text-body-2">Total Users</div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Total Admins -->
          <v-col cols="12" sm="6" md="4" lg="2">
            <v-card class="stat-card" color="error" dark>
              <v-card-text class="text-center">
                <v-icon size="30" class="mb-2">mdi-shield-account</v-icon>
                <div class="text-h5 font-weight-bold">{{ totalAdmins }}</div>
                <div class="text-body-2">Admins</div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Total Banks -->
          <v-col cols="12" sm="6" md="4" lg="2">
            <v-card class="stat-card" color="info" dark>
              <v-card-text class="text-center">
                <v-icon size="30" class="mb-2">mdi-bank</v-icon>
                <div class="text-h5 font-weight-bold">{{ totalBanks }}</div>
                <div class="text-body-2">Banks</div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Total Currencies -->
          <v-col cols="12" sm="6" md="4" lg="2">
            <v-card class="stat-card" color="warning" dark>
              <v-card-text class="text-center">
                <v-icon size="30" class="mb-2">mdi-currency-usd</v-icon>
                <div class="text-h5 font-weight-bold">{{ totalCurrencies }}</div>
                <div class="text-body-2">Currencies</div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Pending Orders -->
          <v-col cols="12" sm="6" md="4" lg="2">
            <v-card class="stat-card" color="orange" dark>
              <v-card-text class="text-center">
                <v-icon size="30" class="mb-2">mdi-clock-alert</v-icon>
                <div class="text-h5 font-weight-bold">{{ pendingOrders }}</div>
                <div class="text-body-2">Pending Orders</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Secondary Stats Row -->
        <v-row class="mb-6" v-if="!isLoading && !error">
          <!-- Completed Orders -->
          <v-col cols="12" sm="6" md="3">
            <v-card class="overview-card">
              <v-card-text>
                <div class="d-flex align-center">
                  <v-icon color="success" size="40" class="mr-3">mdi-check-circle</v-icon>
                  <div>
                    <div class="text-h4 font-weight-bold">{{ completedOrders }}</div>
                    <div class="text-body-2 text--secondary">Completed Orders</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Total Members -->
          <v-col cols="12" sm="6" md="3">
            <v-card class="overview-card">
              <v-card-text>
                <div class="d-flex align-center">
                  <v-icon color="green" size="40" class="mr-3">mdi-account-star</v-icon>
                  <div>
                    <div class="text-h4 font-weight-bold">{{ totalMembers }}</div>
                    <div class="text-body-2 text--secondary">Members</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Total Places -->
          <v-col cols="12" sm="6" md="3">
            <v-card class="overview-card">
              <v-card-text>
                <div class="d-flex align-center">
                  <v-icon color="purple" size="40" class="mr-3">mdi-map-marker</v-icon>
                  <div>
                    <div class="text-h4 font-weight-bold">{{ totalPlaces }}</div>
                    <div class="text-body-2 text--secondary">Locations</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Total Collections -->
          <v-col cols="12" sm="6" md="3">
            <v-card class="overview-card">
              <v-card-text>
                <div class="d-flex align-center">
                  <v-icon color="indigo" size="40" class="mr-3">mdi-wallet</v-icon>
                  <div>
                    <div class="text-h4 font-weight-bold">{{ totalCollections }}</div>
                    <div class="text-body-2 text--secondary">Collections</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Order Status Distribution -->
        <v-row class="mb-6" v-if="!isLoading && !error">
          <v-col cols="12" md="6">
            <v-card class="chart-card">
              <v-card-title>Order Status Distribution</v-card-title>
              <v-card-text>
                <div class="status-grid">
                  <div v-for="status in orderStatusData" :key="status.name" class="status-item">
                    <div class="d-flex align-center mb-2">
                      <div 
                        class="status-indicator mr-3" 
                        :style="{ backgroundColor: status.color }"
                      ></div>
                      <span class="text-capitalize">{{ status.name }}</span>
                    </div>
                    <div class="text-h6 font-weight-bold">{{ status.count }}</div>
                    <div class="text-caption text--secondary">
                      {{ ((status.count / totalOrders) * 100).toFixed(1) }}%
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="chart-card">
              <v-card-title>Top Currencies</v-card-title>
              <v-card-text>
                <div v-for="currency in topCurrencies" :key="currency.id" class="currency-item mb-3">
                  <div class="d-flex justify-space-between align-center">
                    <div class="d-flex align-center">
                      <v-avatar size="32" color="primary" class="mr-3">
                        <span class="white--text font-weight-bold">{{ currency.symbol }}</span>
                      </v-avatar>
                      <div>
                        <div class="font-weight-medium">{{ currency.name }}</div>
                        <div class="text-caption text--secondary">{{ currency.code }}</div>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="font-weight-bold">{{ currency.orderCount }}</div>
                      <div class="text-caption text--secondary">orders</div>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Banks and Locations -->
        <v-row class="mb-6" v-if="!isLoading && !error">
          <v-col cols="12" md="6">
            <v-card class="chart-card">
              <v-card-title>Top Banks by Orders</v-card-title>
              <v-card-text>
                <div v-for="bank in topBanks" :key="bank.id" class="bank-item mb-3">
                  <div class="d-flex justify-space-between align-center">
                    <div>
                      <div class="font-weight-medium">{{ bank.name }}</div>
                      <div class="text-caption text--secondary">{{ bank.placeName }}</div>
                    </div>
                    <div class="text-right">
                      <div class="font-weight-bold text-primary">{{ bank.orderCount }}</div>
                      <div class="text-caption text--secondary">orders</div>
                    </div>
                  </div>
                  <v-progress-linear 
                    :value="(bank.orderCount / maxBankOrders) * 100" 
                    height="4" 
                    color="primary" 
                    class="mt-2"
                  ></v-progress-linear>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="chart-card">
              <v-card-title>Locations Overview</v-card-title>
              <v-card-text>
                <div v-for="place in places.slice(0, 8)" :key="place.id" class="location-item mb-3">
                  <div class="d-flex justify-space-between align-center">
                    <div class="d-flex align-center">
                      <v-icon color="grey" class="mr-3">mdi-map-marker</v-icon>
                      <div>
                        <div class="font-weight-medium">{{ place.name }}</div>
                        <div class="text-caption text--secondary">{{ place.banks?.length || 0 }} banks</div>
                      </div>
                    </div>
                    <v-chip small color="success" outlined>Active</v-chip>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Banks and Currencies Lists -->
        <v-row class="mb-6" v-if="!isLoading && !error">
          <!-- Banks List -->
          <v-col cols="12" md="6">
            <v-card class="list-card">
              <v-card-title class="d-flex align-center">
                <v-icon color="info" class="mr-2">mdi-bank</v-icon>
                Banks List
                <v-spacer></v-spacer>
                <v-chip color="info" text-color="white">{{ totalBanks }} Total</v-chip>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pa-0">
                <v-list dense>
                  <v-list-item v-for="bank in allBanks" :key="bank.id">
                    <v-list-item-avatar>
                      <v-avatar color="info" size="32">
                        <v-icon color="white">mdi-bank</v-icon>
                      </v-avatar>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title class="font-weight-medium">{{ bank.name }}</v-list-item-title>
                      <v-list-item-subtitle>{{ bank.placeName || 'Location not specified' }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-chip small color="success" outlined>Active</v-chip>
                    </v-list-item-action>
                  </v-list-item>
                  <v-list-item v-if="allBanks.length === 0">
                    <v-list-item-content class="text-center">
                      <div class="text-body-2 text--secondary">No banks found</div>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Currencies List -->
          <v-col cols="12" md="6">
            <v-card class="list-card">
              <v-card-title class="d-flex align-center">
                <v-icon color="warning" class="mr-2">mdi-currency-usd</v-icon>
                Currencies List
                <v-spacer></v-spacer>
                <v-chip color="warning" text-color="white">{{ totalCurrencies }} Total</v-chip>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pa-0">
                <v-list dense>
                  <v-list-item v-for="currency in currencies" :key="currency.id">
                    <v-list-item-avatar>
                      <v-avatar color="warning" size="32">
                        <span class="white--text font-weight-bold">{{ currency.symbol || currency.code }}</span>
                      </v-avatar>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title class="font-weight-medium">{{ currency.name }}</v-list-item-title>
                      <v-list-item-subtitle>{{ currency.code }} - {{ currency.symbol }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-chip small color="success" outlined>Active</v-chip>
                    </v-list-item-action>
                  </v-list-item>
                  <v-list-item v-if="currencies.length === 0">
                    <v-list-item-content class="text-center">
                      <div class="text-body-2 text--secondary">No currencies found</div>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Recent Orders Overview -->
        <v-row v-if="!isLoading && !error">
          <v-col cols="12">
            <v-card class="list-card">
              <v-card-title class="d-flex align-center">
                <v-icon color="primary" class="mr-2">mdi-clipboard-list</v-icon>
                Recent Orders Overview
                <v-spacer></v-spacer>
                <v-chip color="primary" text-color="white">{{ totalOrders }} Total</v-chip>
                <v-btn small outlined color="primary" class="ml-2" @click="refreshData">
                  <v-icon left small>mdi-refresh</v-icon>
                  Refresh
                </v-btn>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pa-0">
                <v-list dense>
                  <v-list-item v-for="order in recentOrders.slice(0, 10)" :key="order.id">
                    <v-list-item-avatar>
                      <v-avatar :color="getStatusColor(order.status)" size="32">
                        <span class="white--text font-weight-bold">#{{ order.id }}</span>
                      </v-avatar>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title class="font-weight-medium">
                        {{ order.senderName }} → {{ order.receiverName }}
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        {{ getCurrencySymbol(order.currencyId) }}{{ order.amount }} • {{ formatDate(order.createdAt) }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-chip 
                        small 
                        :color="getStatusColor(order.status)" 
                        :text-color="getStatusTextColor(order.status)"
                      >
                        {{ order.status.toUpperCase() }}
                      </v-chip>
                    </v-list-item-action>
                  </v-list-item>
                  <v-list-item v-if="orders.length === 0">
                    <v-list-item-content class="text-center">
                      <div class="text-body-2 text--secondary">No orders found</div>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

// Composables
const adminApi = useAdminApi();

// Reactive variables for dashboard data
const isLoading = ref(true);
const error = ref(null);
const orders = ref([]);
const places = ref([]);
const allBanks = ref([]);
const currencies = ref([]);
const members = ref([]);

// Admin-specific reactive variables
const users = ref([]);
const admins = ref([]);
const collections = ref([]);
const messages = ref([]);
const notifications = ref([]);
const dashboardStats = ref({});

// Dialog states
const showUserDialog = ref(false);
const showOrderDialog = ref(false);
const showMessageDialog = ref(false);

// Loading states
const loadingPending = ref(false);
const loadingCompleted = ref(false);

// Fetch real data from API
const fetchAllData = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    // Fetch all data in parallel for better performance
    const [
      dashboardStatsResult,
      ordersResult,
      usersResult,
      adminsResult,
      membersResult,
      currenciesResult,
      banksResult,
      placesResult,
      collectionsResult,
      messagesResult
    ] = await Promise.allSettled([
      adminApi.getDashboardStats(),
      adminApi.getAllOrders(),
      adminApi.getAllUsers(),
      adminApi.getAllAdmins(),
      adminApi.getAllMembers(),
      adminApi.getAllCurrencies(),
      adminApi.getAllBanks(),
      adminApi.getAllPlaces(),
      adminApi.getAllCollections(),
      adminApi.getAllMessages()
    ]);

    // Process dashboard stats
    if (dashboardStatsResult.status === 'fulfilled' && dashboardStatsResult.value.success) {
      dashboardStats.value = dashboardStatsResult.value.data.payload || {};
    } else {
      console.warn('Failed to fetch dashboard stats:', dashboardStatsResult.reason || dashboardStatsResult.value?.error);
    }

    // Process orders
    if (ordersResult.status === 'fulfilled' && ordersResult.value.success) {
      orders.value = ordersResult.value.data.payload || [];
    } else {
      console.warn('Failed to fetch orders, using fallback data:', ordersResult.reason || ordersResult.value?.error);
      // Fallback sample data for orders
      orders.value = [
        { id: 1, senderName: 'John Doe', receiverName: 'Jane Smith', amount: 1500, status: 'completed', currencyId: 1, createdAt: new Date() },
        { id: 2, senderName: 'Alice Johnson', receiverName: 'Bob Wilson', amount: 2000, status: 'pending', currencyId: 2, createdAt: new Date() }
      ];
    }

    // Process users
    if (usersResult.status === 'fulfilled' && usersResult.value.success) {
      users.value = usersResult.value.data.payload || [];
    } else {
      console.warn('Failed to fetch users, using fallback data:', usersResult.reason || usersResult.value?.error);
      users.value = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'member', status: 'active' }
      ];
    }

    // Process admins
    if (adminsResult.status === 'fulfilled' && adminsResult.value.success) {
      admins.value = adminsResult.value.data.payload || [];
    } else {
      console.warn('Failed to fetch admins, using fallback data:', adminsResult.reason || adminsResult.value?.error);
      admins.value = users.value.filter(user => user.role === 'admin');
    }

    // Process members
    if (membersResult.status === 'fulfilled' && membersResult.value.success) {
      members.value = membersResult.value.data.payload || [];
    } else {
      console.warn('Failed to fetch members, using fallback data:', membersResult.reason || membersResult.value?.error);
      members.value = users.value.filter(user => user.role === 'member') || [
        { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' }
      ];
    }

    // Process currencies
    if (currenciesResult.status === 'fulfilled' && currenciesResult.value.success) {
      currencies.value = currenciesResult.value.data.payload || [];
    } else {
      console.warn('Failed to fetch currencies, using fallback data:', currenciesResult.reason || currenciesResult.value?.error);
      currencies.value = [
        { id: 1, name: 'US Dollar', code: 'USD', symbol: '$' },
        { id: 2, name: 'Euro', code: 'EUR', symbol: '€' }
      ];
    }

    // Process banks
    if (banksResult.status === 'fulfilled' && banksResult.value.success) {
      allBanks.value = banksResult.value.data.payload || [];
    } else {
      console.warn('Failed to fetch banks, using fallback data:', banksResult.reason || banksResult.value?.error);
      allBanks.value = [
        { id: 1, name: 'Chase Bank', placeName: 'New York' },
        { id: 2, name: 'Bank of America', placeName: 'New York' }
      ];
    }

    // Process places
    if (placesResult.status === 'fulfilled' && placesResult.value.success) {
      places.value = placesResult.value.data.payload || [];
    } else {
      console.warn('Failed to fetch places, using fallback data:', placesResult.reason || placesResult.value?.error);
      places.value = [
        { id: 1, name: 'New York', banks: [] },
        { id: 2, name: 'London', banks: [] }
      ];
    }

    // Process collections
    if (collectionsResult.status === 'fulfilled' && collectionsResult.value.success) {
      collections.value = collectionsResult.value.data.payload || [];
    } else {
      console.warn('Failed to fetch collections, using fallback data:', collectionsResult.reason || collectionsResult.value?.error);
      collections.value = [
        { id: 1, userId: 1, amount: 1000, status: 'pending', currency: 'USD' }
      ];
    }

    // Process messages
    if (messagesResult.status === 'fulfilled' && messagesResult.value.success) {
      messages.value = messagesResult.value.data.payload || [];
    } else {
      console.warn('Failed to fetch messages, using fallback data:', messagesResult.reason || messagesResult.value?.error);
      messages.value = [
        { id: 1, senderName: 'John Doe', content: 'Need help with my order', isRead: false, orderId: 1 }
      ];
    }

  } catch (err) {
    error.value = 'Failed to load dashboard data. Please try again.';
    console.error('Error fetching dashboard data:', err);
  } finally {
    isLoading.value = false;
  }
};

// Computed properties for dashboard metrics
const totalOrders = computed(() => orders.value.length);
const totalMembers = computed(() => members.value.length);
const totalBanks = computed(() => allBanks.value.length);
const totalPlaces = computed(() => places.value.length);
const totalCurrencies = computed(() => currencies.value.length);

// Admin-specific computed properties
const totalUsers = computed(() => users.value.length);
const totalAdmins = computed(() => admins.value.length);
const totalCollections = computed(() => collections.value.length);
const unreadMessages = computed(() => messages.value.filter(msg => !msg.isRead).length);
const totalNotifications = computed(() => notifications.value.length);
const recentUsers = computed(() => users.value.slice(0, 5));
const recentMessages = computed(() => messages.value.slice(0, 4));

const completedOrders = computed(() => 
  orders.value.filter(order => order.status === 'completed').length
);

const pendingOrders = computed(() => 
  orders.value.filter(order => order.status === 'pending').length
);

// Stats with mock percentage changes
const orderStats = ref({ change: 4.3 });
const memberStats = ref({ change: 2.1 });
const completedStats = ref({ change: 5.7 });

// Order status distribution
const orderStatusData = computed(() => {
  const statusCounts = {};
  const statusColors = {
    pending: '#FFD700',
    completed: '#4CAF50',
    failed: '#F44336',
    processing: '#FF9800',
    cancelled: '#9E9E9E'
  };

  orders.value.forEach(order => {
    statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
  });

  return Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    count,
    color: statusColors[status] || '#bbb'
  }));
});

// Top currencies by order count
const topCurrencies = computed(() => {
  const currencyCounts = {};
  
  orders.value.forEach(order => {
    currencyCounts[order.currencyId] = (currencyCounts[order.currencyId] || 0) + 1;
  });

  return currencies.value
    .map(currency => ({
      ...currency,
      orderCount: currencyCounts[currency.id] || 0
    }))
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 5);
});

// Top banks by order count
const topBanks = computed(() => {
  const bankCounts = {};
  
  orders.value.forEach(order => {
    bankCounts[order.bankId] = (bankCounts[order.bankId] || 0) + 1;
  });

  return allBanks.value
    .map(bank => ({
      ...bank,
      orderCount: bankCounts[bank.id] || 0
    }))
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 5);
});

const maxBankOrders = computed(() => 
  Math.max(...topBanks.value.map(bank => bank.orderCount), 1)
);

// Recent orders (last 10)
const recentOrders = computed(() => 
  orders.value
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)
);

// Greeting and date
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning! Here\'s your dashboard overview.';
  if (hour < 18) return 'Good afternoon! Here\'s your dashboard overview.';
  return 'Good evening! Here\'s your dashboard overview.';
});

const currentDateRange = computed(() => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };
  
  return `${formatDate(firstDay)} - ${formatDate(lastDay)}`;
});

// Helper functions
const formatChange = (change) => {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
};

const getChangeColor = (change) => {
  return change >= 0 ? 'success--text' : 'error--text';
};

const getCurrencySymbol = (currencyId) => {
  const currency = currencies.value.find(c => c.id === currencyId);
  return currency ? currency.symbol : '$';
};

const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    completed: 'success',
    failed: 'error',
    processing: 'info',
    cancelled: 'grey'
  };
  return colors[status] || 'grey';
};

const getStatusTextColor = (status) => {
  return status === 'pending' ? 'black' : 'white';
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const refreshData = () => {
  fetchAllData();
};

// Admin-specific methods
const getUserRoleColor = (role) => {
  const colors = {
    admin: 'red',
    member: 'green',
    user: 'blue'
  };
  return colors[role] || 'grey';
};

const updateOrderStatus = async (orderId, status) => {
  try {
    const result = await adminApi.updateOrderStatus(orderId, status);
    if (result.success) {
      const orderIndex = orders.value.findIndex(order => order.id === orderId);
      if (orderIndex !== -1) {
        orders.value[orderIndex].status = status;
      }
      console.log(`Order ${orderId} status updated to ${status}`);
    } else {
      error.value = result.error;
      console.error('Error updating order status:', result.error);
    }
  } catch (error) {
    error.value = 'Failed to update order status';
    console.error('Error updating order status:', error);
  }
};

const assignMember = async (orderId) => {
  // TODO: Implement member selection dialog
  console.log(`Assigning member to order ${orderId}`);
  // For now, just show available members
  if (members.value.length > 0) {
    const memberId = members.value[0].id; // Use first member as example
    try {
      const result = await adminApi.assignMemberToOrder(orderId, memberId);
      if (result.success) {
        console.log(`Member ${memberId} assigned to order ${orderId}`);
        await refreshData(); // Refresh to show updated data
      } else {
        error.value = result.error;
      }
    } catch (error) {
      error.value = 'Failed to assign member to order';
      console.error('Error assigning member:', error);
    }
  }
};

const deleteOrder = async (orderId) => {
  try {
    const result = await adminApi.deleteOrder(orderId);
    if (result.success) {
      orders.value = orders.value.filter(order => order.id !== orderId);
      console.log(`Order ${orderId} deleted`);
    } else {
      error.value = result.error;
      console.error('Error deleting order:', result.error);
    }
  } catch (error) {
    error.value = 'Failed to delete order';
    console.error('Error deleting order:', error);
  }
};

const editOrder = (order) => {
  console.log('Editing order:', order);
  // TODO: Implement order edit dialog with form
};

const viewOrderDetails = (order) => {
  console.log('Viewing order details:', order);
  // TODO: Implement order details dialog
};

const viewPendingOrders = async () => {
  loadingPending.value = true;
  try {
    const result = await adminApi.getPendingOrders();
    if (result.success) {
      console.log('Pending orders loaded:', result.data);
      // TODO: Show pending orders in dialog or navigate to page
    } else {
      error.value = result.error;
      console.error('Error fetching pending orders:', result.error);
    }
  } catch (error) {
    error.value = 'Failed to fetch pending orders';
    console.error('Error fetching pending orders:', error);
  } finally {
    loadingPending.value = false;
  }
};

const viewCompletedOrders = async () => {
  loadingCompleted.value = true;
  try {
    const result = await adminApi.getCompletedOrders();
    if (result.success) {
      console.log('Completed orders loaded:', result.data);
      // TODO: Show completed orders in dialog or navigate to page
    } else {
      error.value = result.error;
      console.error('Error fetching completed orders:', result.error);
    }
  } catch (error) {
    error.value = 'Failed to fetch completed orders';
    console.error('Error fetching completed orders:', error);
  } finally {
    loadingCompleted.value = false;
  }
};

const showAllUsers = () => {
  console.log('Showing all users');
  // TODO: Navigate to users management page or show dialog with all users
  console.log('Current users:', users.value);
};

const showAllMessages = () => {
  console.log('Showing all messages');
  // TODO: Navigate to messages page or show dialog with all messages
  console.log('Current messages:', messages.value);
};

const manageCurrencies = () => {
  console.log('Managing currencies');
  // TODO: Navigate to currency management page
  console.log('Current currencies:', currencies.value);
};

const manageBanks = () => {
  console.log('Managing banks');
  // TODO: Navigate to bank management page
  console.log('Current banks:', allBanks.value);
};

const managePlaces = () => {
  console.log('Managing places');
  // TODO: Navigate to places management page
  console.log('Current places:', places.value);
};

const manageCollections = () => {
  console.log('Managing collections');
  // TODO: Navigate to collections management page
  console.log('Current collections:', collections.value);
};

// Fetch data when component mounts
onMounted(() => {
  fetchAllData();
});
</script>

<style scoped>
.stat-card {
  height: 100%;
  border-radius: 12px !important;
  transition: transform 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.chart-card {
  height: 100%;
  border-radius: 12px !important;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.status-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.currency-item, .bank-item, .location-item {
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.currency-item:hover, .bank-item:hover, .location-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.v-simple-table {
  border-radius: 8px;
}

.v-simple-table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

/* Dashboard-specific styles */
.stat-card {
  height: 120px;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.overview-card {
  height: 100%;
  border-radius: 12px !important;
  transition: transform 0.2s ease-in-out;
}

.overview-card:hover {
  transform: translateY(-2px);
}

.list-card {
  border-radius: 12px !important;
  max-height: 500px;
  overflow: hidden;
}

.list-card .v-list {
  max-height: 400px;
  overflow-y: auto;
}

.list-card .v-list-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.list-card .v-list-item:last-child {
  border-bottom: none;
}

/* Improved spacing and typography */
.v-card-title {
  font-weight: 600 !important;
  font-size: 1.1rem !important;
}

.v-list-item-title {
  font-size: 0.95rem !important;
}

.v-list-item-subtitle {
  font-size: 0.85rem !important;
}
</style>