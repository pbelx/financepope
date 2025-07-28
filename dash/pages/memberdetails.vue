<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h4">Member Details</span>
            <v-btn icon @click="goBack">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text v-if="loading">
            <div class="text-center py-8">
              <v-progress-circular indeterminate color="primary" size="64" />
              <p class="mt-4 text-grey-600">Loading member details...</p>
            </div>
          </v-card-text>

          <v-card-text v-else-if="member">
            <v-row>
              <v-col cols="12" md="6">
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title class="text-h6">{{ member.full_name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ member.email }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-col>
            </v-row>
            
            <v-divider class="my-4" />

            <h5 class="text-h5 mb-4">Activity Overview</h5>
            <v-row>
              <v-col cols="12" md="4">
                <v-card class="text-center" variant="outlined">
                  <v-card-text>
                    <div class="text-h4 font-weight-bold text-success">{{ totalCompletedOrders }}</div>
                    <div class="text-subtitle-1 text-grey-darken-1">Completed Orders</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card class="text-center" variant="outlined">
                  <v-card-text>
                    <div class="text-h4 font-weight-bold text-warning">{{ totalPendingOrders }}</div>
                    <div class="text-subtitle-1 text-grey-darken-1">Pending Orders</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card class="text-center" variant="outlined">
                  <v-card-text>
                    <div class="text-h4 font-weight-bold text-primary">{{ totalCollections }}</div>
                    <div class="text-subtitle-1 text-grey-darken-1">Total Collections</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
            
            <h5 class="text-h5 mb-4 mt-8">Currency Balances</h5>
            <p class="text-body-2 text-grey-darken-1 mb-4">
              This table shows the net amount per currency (Total Confirmed Collections - Total Completed Orders).
            </p>
            <v-data-table
              :headers="balanceHeaders"
              :items="currencyBalances"
              :loading="loading"
              class="elevation-1"
              :items-per-page="5"
              item-key="id"
            >
              <template #item.currency="{ item }">
                 <v-chip size="small" variant="tonal" color="primary">{{ item.currency.code }}</v-chip>
              </template>
              <template #item.totalCollected="{ item }">
                <span class="font-weight-medium text-blue-darken-2">{{ formatAmount(item.totalCollected, item.currency) }}</span>
              </template>
              <template #item.totalSent="{ item }">
                <span class="font-weight-medium text-deep-orange-darken-2">{{ formatAmount(item.totalSent, item.currency) }}</span>
              </template>
              <template #item.balance="{ item }">
                <v-chip :color="item.balance >= 0 ? 'success' : 'error'" size="small" variant="flat">
                  <span class="font-weight-bold">{{ formatAmount(item.balance, item.currency) }}</span>
                </v-chip>
              </template>
            </v-data-table>

            <h5 class="text-h5 mb-4 mt-8">Completed Orders</h5>
            <v-data-table
              :headers="orderHeaders"
              :items="member.orders"
              :loading="loading"
              class="elevation-1"
              :items-per-page="5"
              item-key="id"
            >
              <template #item.id="{ item }">
                <v-chip size="small" variant="outlined" prepend-icon="mdi-pound">{{ item.id }}</v-chip>
              </template>
              <template #item.amount="{ item }">
                <span class="font-weight-medium">{{ formatAmount(item.amount, item.to_currency) }}</span>
              </template>
              <template #item.currency_exchange="{ item }">
                <span class="text-body-2">{{ formatFromToCurrencyDisplay(item.from_currency, item.to_currency) }}</span>
              </template>
              <template #item.status="{ item }">
                <v-chip :color="getStatusColor(item.status)" size="small">{{ item.status }}</v-chip>
              </template>
              <template #item.created_at="{ item }">
                <span class="text-caption">{{ formatDate(item.created_at) }}</span>
              </template>
            </v-data-table>

            <h5 class="text-h5 mb-4 mt-8">Pending Orders</h5>
            <v-data-table
              :headers="pendingOrderHeaders"
              :items="pendingOrders"
              :loading="loading"
              class="elevation-1"
              :items-per-page="5"
              item-key="id"
            >
              <template #item.id="{ item }">
                <v-chip size="small" variant="outlined" prepend-icon="mdi-pound">{{ item.id }}</v-chip>
              </template>
              <template #item.amount="{ item }">
                 <span class="font-weight-medium">{{ formatAmount(item.amount, item.to_currency) }}</span>
              </template>
              <template #item.currency_exchange="{ item }">
                <span class="text-body-2">{{ formatFromToCurrencyDisplay(item.from_currency, item.to_currency) }}</span>
              </template>
              <template #item.status="{ item }">
                <v-chip :color="getStatusColor(item.status)" size="small">{{ item.status }}</v-chip>
              </template>
              <template #item.created_at="{ item }">
                <span class="text-caption">{{ formatDate(item.created_at) }}</span>
              </template>
            </v-data-table>

            <h5 class="text-h5 mb-4 mt-8">Collections</h5>
            <v-data-table
              :headers="collectionHeaders"
              :items="collections"
              :loading="loading"
              class="elevation-1"
              :items-per-page="5"
              item-key="id"
            >
              <template #item.id="{ item }">
                <v-chip size="small" variant="outlined" prepend-icon="mdi-pound">{{ item.id }}</v-chip>
              </template>
              <template #item.amount="{ item }">
                 <span class="font-weight-medium">{{ formatAmount(item.amount, item.currency) }}</span>
              </template>
              <template #item.currency_exchange="{ item }">
                <span class="text-body-2">{{ item.currency.code || item.currency.name }}</span>
              </template>
              <template #item.status="{ item }">
                <v-chip :color="getStatusColor(item.status)" size="small">{{ item.status }}</v-chip>
              </template>
              <template #item.created_at="{ item }">
                <span class="text-caption">{{ formatDate(item.created_at) }}</span>
              </template>
            </v-data-table>

          </v-card-text>

          <v-card-text v-else>
            <div class="text-center py-8">
              <v-icon size="64" color="grey-400">mdi-account-off</v-icon>
              <p class="mt-4 text-grey-600 text-h6">Member not found</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="errorSnackbar" color="error" timeout="5000">
      {{ errorMessage }}
      <template #actions>
        <v-btn color="white" variant="text" @click="errorSnackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Page metadata
definePageMeta({
  title: 'Member Details',
  requiresAuth: true
})

// Composables
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const { token } = useAuth()

// Reactive data
const member = ref(null)
const loading = ref(true)
const errorSnackbar = ref(false)
const errorMessage = ref('')
const pendingOrders = ref([])
const collections = ref([])
const currencies = ref([])

// Table headers
const orderHeaders = [
  { title: 'Order ID', key: 'id', sortable: true, width: '120px' },
  { title: 'Amount', key: 'amount', sortable: true },
  { title: 'From → To', key: 'currency_exchange', sortable: false },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Date', key: 'created_at', sortable: true },
]

const pendingOrderHeaders = [
  { title: 'Order ID', key: 'id', sortable: true, width: '120px' },
  { title: 'Amount', key: 'amount', sortable: true },
  { title: 'From → To', key: 'currency_exchange', sortable: false },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Date', key: 'created_at', sortable: true },
]

const collectionHeaders = [
  { title: 'Collection ID', key: 'id', sortable: true, width: '120px' },
  { title: 'Amount', key: 'amount', sortable: true },
  { title: 'Currency', key: 'currency_exchange', sortable: false },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Date', key: 'created_at', sortable: true },
]

const balanceHeaders = [
  { title: 'Currency', key: 'currency', sortable: true },
  { title: 'Total Collected', key: 'totalCollected', sortable: true },
  { title: 'Total Sent (Orders)', key: 'totalSent', sortable: true },
  { title: 'Net Balance', key: 'balance', sortable: true },
]

// Computed properties for stats
const totalCompletedOrders = computed(() => member.value?.orders?.length || 0)
const totalPendingOrders = computed(() => pendingOrders.value?.length || 0)
const totalCollections = computed(() => collections.value?.length || 0)

// Computed property for currency balances
const currencyBalances = computed(() => {
  const balances = new Map()

  // 1. Sum up all CONFIRMED collections by currency
  collections.value.forEach(collection => {
    if (collection.currency && collection.status.toLowerCase() === 'confirmed') {
      const code = collection.currency.code
      const current = balances.get(code) || { totalCollected: 0, totalSent: 0, currency: collection.currency }
      current.totalCollected += parseFloat(collection.amount)
      balances.set(code, current)
    }
  })

  // 2. Sum up all COMPLETED orders by their 'to_currency'
  if (member.value?.orders) {
    member.value.orders.forEach(order => {
      if (order.to_currency) {
        const code = order.to_currency.code
        const current = balances.get(code) || { totalCollected: 0, totalSent: 0, currency: order.to_currency }
        current.totalSent += parseFloat(order.amount)
        balances.set(code, current)
      }
    })
  }

  // 3. Format for the data table
  return Array.from(balances.entries()).map(([code, data]) => ({
    id: code,
    currency: data.currency,
    totalCollected: data.totalCollected,
    totalSent: data.totalSent,
    balance: data.totalCollected - data.totalSent,
  }))
})


// Get authorization headers
const getAuthHeaders = () => {
  const authToken = token.value
  if (!authToken) {
    console.error('No authentication token found')
    return {}
  }
  return {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  }
}

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  // Format as DD/MM/YYYY
  return new Date(dateString).toLocaleDateString('en-GB')
}

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'confirmed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'failed':
    case 'rejected':
      return 'error'
    default:
      return 'grey'
  }
}

// Improved, locale-aware amount formatter
const formatAmount = (amount, currency) => {
  const number = parseFloat(amount);
  if (isNaN(number)) {
    return 'N/A';
  }

  const currencyCode = currency?.code || 'UGX';

  // For currencies like UGX, we don't want decimal places.
  // For others like USD, we do.
  let fractionDigits = 0; // Default for UGX, JPY, etc.
  if (['USD', 'EUR', 'GBP'].includes(currencyCode)) {
    fractionDigits = 2;
  }

  const options = {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  };

  // Intl.NumberFormat is the modern way to format currency correctly
  return new Intl.NumberFormat('en', options).format(number);
};

const formatFromToCurrencyDisplay = (fromCurrency, toCurrency) => {
  if (fromCurrency && toCurrency) {
    const fromDisplay = fromCurrency.code || fromCurrency.name || ''
    const toDisplay = toCurrency.code || toCurrency.name || ''
    return `${fromDisplay} → ${toDisplay}`
  }
  const currency = fromCurrency || toCurrency
  if (currency) {
    return currency.code || currency.name || ''
  }
  return 'N/A'
}

const showError = (message) => {
  errorMessage.value = message
  errorSnackbar.value = true
}

const goBack = () => {
  router.back()
}

// API functions
const fetchCurrencies = async () => {
  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/currency/all`, {
      headers: getAuthHeaders()
    })
    if (response.status && response.payload) {
      currencies.value = response.payload
    } else {
      showError('Failed to fetch currency list')
    }
  } catch (error) {
    console.error('Error fetching currencies:', error)
    showError(`Error fetching currencies: ${error.message || 'Network error'}`)
  }
}

const findCurrencyById = (id) => currencies.value.find(c => c.id === id) || null

const fetchMemberDetails = async () => {
  const memberId = route.query.id
  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/users/user/${memberId}`, {
      headers: getAuthHeaders()
    })
    if (response.status && response.payload) {
      member.value = response.payload
    } else {
      showError('Failed to fetch member details')
    }
  } catch (error) {
    console.error('Error fetching member details:', error)
    showError(`Error fetching member details: ${error.message || 'Network error'}`)
  }
}

const fetchMemberOrders = async () => {
  const memberId = route.query.id;
  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/order/completed/member/${memberId}`, {
      headers: getAuthHeaders()
    });
    if (response.status && response.payload) {
      const mappedOrders = response.payload.map(order => ({
        ...order,
        from_currency: findCurrencyById(order.fromCurrency),
        to_currency: findCurrencyById(order.receiverCurrency)
      }));
      // Simplified: Directly assign orders to the member object.
      member.value.orders = mappedOrders;
    } else {
      showError('Failed to fetch member orders');
    }
  } catch (error) {
    console.error('Error fetching member orders:', error);
    showError(`Error fetching member orders: ${error.message || 'Network error'}`);
  }
};

const fetchPendingOrders = async () => {
  const memberId = route.query.id
  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/order/pending/user/${memberId}`, {
      headers: getAuthHeaders()
    })
    if (response.status && response.payload) {
      pendingOrders.value = response.payload.map(order => ({
        ...order,
        from_currency: findCurrencyById(order.fromCurrency),
        to_currency: findCurrencyById(order.receiverCurrency)
      }))
    } else {
      showError('Failed to fetch pending orders')
    }
  } catch (error) {
    console.error('Error fetching pending orders:', error)
    showError(`Error fetching pending orders: ${error.message || 'Network error'}`)
  }
}

const fetchMemberCollections = async () => {
  const memberId = route.query.id;
  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/collections/member/${memberId}`, {
      headers: getAuthHeaders()
    });

    if (response.status && response.payload) {
      // The API already provides the nested currency object, so no mapping is needed.
      collections.value = response.payload;
    } else {
      showError('Failed to fetch member collections');
    }
  } catch (error) {
    console.error('Error fetching member collections:', error);
    showError(`Error fetching member collections: ${error.message || 'Network error'}`);
  }
};

// Lifecycle hook with corrected data fetching sequence
onMounted(async () => {
  loading.value = true;
  try {
    // First, fetch currency data, as it's needed for mapping
    await fetchCurrencies();

    // THEN, fetch the primary member details and wait for it to complete
    await fetchMemberDetails();

    // Only if the member was successfully found, proceed to fetch their related data.
    // We can run these in parallel now because they don't depend on each other.
    if (member.value) {
      await Promise.all([
        fetchMemberOrders(),
        fetchPendingOrders(),
        fetchMemberCollections()
      ]);
    }
  } catch (error) {
    console.error("Failed to load page data:", error);
    showError("A critical error occurred while loading member data.");
  } finally {
    // Finally, always turn off the loading indicator
    loading.value = false;
  }
});

</script>

<style scoped>
.v-card-title {
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}
.v-data-table {
  border-radius: 8px;
}
.v-btn {
  text-transform: none;
}
</style>