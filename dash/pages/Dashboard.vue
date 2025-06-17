<template>
    <v-app>
      <v-main>
        <v-container fluid class="pa-6">
          <div class="d-flex justify-space-between align-center mb-6">
            <div>
              <h1 class="text-h4 font-weight-bold">Analytics</h1>
            </div>
            <div class="d-flex align-center">
              <span class="text-body-2 text--secondary mr-2">01.08.2022 - 31.08.2022</span>
              <v-icon color="grey">mdi-calendar</v-icon>
            </div>
          </div>
  
          <v-row class="mb-6">
            <v-col cols="12" sm="6" md="3">
              <v-card class="stat-card">
                <v-card-text class="pb-2">
                  <div class="d-flex justify-space-between align-start">
                    <div>
                      <p class="text-body-2 text--secondary mb-1">Orders</p>
                      <h2 class="text-h4 font-weight-bold">201</h2>
                      <p class="text-caption text--secondary">+4.3% from last month</p>
                    </div>
                    <v-icon color="grey lighten-1">mdi-clipboard-list</v-icon>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
  
            <v-col cols="12" sm="6" md="3">
              <v-card class="stat-card">
                <v-card-text class="pb-2">
                  <div class="d-flex justify-space-between align-start">
                    <div>
                      <p class="text-body-2 text--secondary mb-1">Approved</p>
                      <h2 class="text-h4 font-weight-bold">36</h2>
                      <p class="text-caption text--secondary">+2.4% from last month</p>
                    </div>
                    <v-icon color="grey lighten-1">mdi-check-circle</v-icon>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
  
            <v-col cols="12" sm="6" md="3">
              <v-card class="stat-card">
                <v-card-text class="pb-2">
                  <div class="d-flex justify-space-between align-start">
                    <div>
                      <p class="text-body-2 text--secondary mb-1">Users</p>
                      <h2 class="text-h4 font-weight-bold">4,890</h2>
                      <p class="text-caption text--secondary">+1.2% from last month</p>
                    </div>
                    <v-icon color="grey lighten-1">mdi-account-group</v-icon>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
  
            <v-col cols="12" sm="6" md="3">
              <v-card class="stat-card">
                <v-card-text class="pb-2">
                  <div class="d-flex justify-space-between align-start">
                    <div>
                      <p class="text-body-2 text--secondary mb-1">Subscriptions</p>
                      <h2 class="text-h4 font-weight-bold">1,201</h2>
                      <p class="text-caption text--secondary">+0.8% from last month</p>
                    </div>
                    <v-icon color="grey lighten-1">mdi-credit-card</v-icon>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
  
          <v-row>
            <v-col cols="12" md="8">
              <v-row class="mb-4">
                <v-col cols="6">
                  <v-card class="pa-4">
                    <div class="d-flex align-center mb-2">
                      <v-icon color="grey">mdi-currency-usd</v-icon>
                      <span class="ml-2 text-body-2 text--secondary">Month total</span>
                    </div>
                    <h2 class="text-h4 font-weight-bold">25410</h2>
                    <p class="text-caption text--secondary">+2.1% from last month</p>
                  </v-card>
                </v-col>
                <v-col cols="6">
                  <v-card class="pa-4">
                    <div class="d-flex align-center mb-2">
                      <v-icon color="grey">mdi-chart-line</v-icon>
                      <span class="ml-2 text-body-2 text--secondary">Revenue</span>
                    </div>
                    <h2 class="text-h4 font-weight-bold">1352</h2>
                    <p class="text-caption text--secondary">+4.3% from last month</p>
                  </v-card>
                </v-col>
              </v-row>
  
              <v-card class="mb-4">
                <v-card-title>
                  <span>Sales dynamics</span>
                  <v-spacer></v-spacer>
                  <span class="text-body-2 text--secondary">2021</span>
                </v-card-title>
                <v-card-text>
                  <div class="chart-placeholder">
                    <p class="text-center text--secondary">Chart Area</p>
                    <p class="text-center text--secondary">Add your chart component here</p>
                  </div>
                </v-card-text>
              </v-card>
  
              <v-card>
                <v-card-title>
                  <span>Overall User Activity</span>
                  <v-spacer></v-spacer>
                  <span class="text-body-2 text--secondary">2021</span>
                </v-card-title>
                <v-card-text>
                  <div class="chart-placeholder">
                    <p class="text-center text--secondary">Activity Chart Area</p>
                    <p class="text-center text--secondary">Add your activity chart here</p>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
  
            <v-col cols="12" md="4">
              <v-row class="mb-4">
                <v-col cols="12">
                  <v-card class="pa-4 text-center">
                    <div class="chart-placeholder-small mb-2">
                      <p class="text--secondary">Donut Chart</p>
                    </div>
                    <p class="text-body-2 text--secondary">Chart data goes here</p>
                  </v-card>
                </v-col>
              </v-row>
  
              <v-row class="mb-4">
                <v-col cols="6">
                  <v-card class="pa-3 text-center">
                    <div class="mb-2">
                      <v-icon color="primary">mdi-file-document</v-icon>
                    </div>
                    <p class="text-body-2 text--secondary mb-1">Paid Invoices</p>
                    <h3 class="font-weight-bold">$30256.23</h3>
                  </v-card>
                </v-col>
                <v-col cols="6">
                  <v-card class="pa-3 text-center">
                    <div class="mb-2">
                      <v-icon color="success">mdi-cash</v-icon>
                    </div>
                    <p class="text-body-2 text--secondary mb-1">Orders received</p>
                    <h3 class="font-weight-bold">$150256.23</h3>
                  </v-card>
                </v-col>
              </v-row>
  
              <v-card>
                <v-card-title class="pb-2">
                  <span>Customer order</span>
                  <v-spacer></v-spacer>
                  <v-icon small>mdi-dots-vertical</v-icon>
                </v-card-title>
                <v-card-text class="pa-0">
                  <v-simple-table dense>
                    <tbody>
                      <tr v-for="order in customerOrders" :key="order.id">
                        <td class="pa-2">
                          <v-avatar size="24" :color="order.color" class="mr-2">
                            <span class="white--text text-caption">{{ order.initials }}</span>
                          </v-avatar>
                          {{ order.name }}
                        </td>
                        <td class="pa-2 text-right">
                          <v-chip small :color="order.status === 'Delivered' ? 'success' : 'warning'" text-color="white">
                            {{ order.status }}
                          </v-chip>
                        </td>
                      </tr>
                    </tbody>
                  </v-simple-table>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-main>
    </v-app>
  </template>
  
  <script setup>
  // In Nuxt 3 with Vue 3's Composition API, you don't need to import 'ref'
  // if you're using it within <script setup>. It's auto-imported.
  // However, if you were using <script> with setup(), you would need it.
  
  // Customer orders data
  const customerOrders = [
    { id: 1, name: 'Preston', initials: 'P', status: 'Delivered', color: 'orange' },
    { id: 2, name: 'Melvin', initials: 'M', status: 'Processed', color: 'blue' },
    { id: 3, name: 'Alex', initials: 'A', status: 'Cancelled', color: 'red' },
    { id: 4, name: 'Robert', initials: 'R', status: 'Delivered', color: 'green' }
  ];
  
  // If you need to manage the navigation drawer's state from this page,
  // for instance, if it's not entirely controlled by the layout,
  // you might expose a reactive variable:
  // const drawer = ref(false);
  // No need to return it explicitly in <script setup> as it's automatically exposed.
  </script>
  
  <style scoped>
  .stat-card {
    height: 100%;
    border-radius: 8px !important;
  }
  
  .chart-placeholder {
    height: 200px;
    background: #f8f9fa;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed #dee2e6;
  }
  
  .chart-placeholder-small {
    height: 100px;
    background: #f8f9fa;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed #dee2e6;
  }
  
  /*
    The following styles are typically for a navigation drawer component
    and might be better placed within a dedicated layout or component CSS,
    rather than directly in a page component.
  */
  .v-navigation-drawer {
    border-right: 1px solid #e9ecef !important;
  }
  
  .v-list-item {
    margin: 0 8px;
    border-radius: 8px;
  }
  
  .v-list-item--active {
    background: #6c5ce7 !important;
    color: white !important;
  }
  
  .v-list-item--active .v-icon {
    color: white !important;
  }
  </style>